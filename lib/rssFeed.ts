import { getPublishedPosts, postThumbnail } from "@/lib/blogStore";
import { getComplexDescriptions } from "@/lib/complexDescriptionStore";
import { sanitizeDescriptionHtml } from "@/lib/sanitizeDescriptionHtml";
import { complexData, getComplexFullName } from "@/lib/vrData";

// /rss.xml, /feed 공용 RSS: 블로그 글 + 단지별 VR 페이지 + 주요 페이지

const SITE = "https://www.allview.kr";
const OG_IMAGE = "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg";
/** 단지 소개 글을 채운 날 (VR 단지 페이지 pubDate) */
const COMPLEX_PUB_DATE = new Date("2026-09-24T00:00:00+09:00");
const PAGES_PUB_DATE = new Date("2026-09-27T00:00:00+09:00");

interface FeedItem {
  title: string;
  link: string;
  description: string;
  image?: string;
  pubDate: Date;
}

const MAIN_PAGES: Omit<FeedItem, "pubDate">[] = [
  {
    title: "AllView360(올뷰360) - 부산 강서구 부동산 통합 플랫폼",
    link: SITE,
    description:
      "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 VR투어, 평면도, 실거래가, 분양정보를 한 곳에서 제공하는 부동산 정보 플랫폼입니다.",
  },
  {
    title: "아파트 VR 투어 | AllView360 - 명지오션시티·명지국제신도시·에코델타시티",
    link: `${SITE}/vr-tour`,
    description:
      "부산 강서구 아파트 단지별·평형별 실내를 360° VR로 둘러보고 배치도와 평면도, 단지 소개를 함께 확인하세요.",
  },
  {
    title: "아파트 실거래가 분석 | AllView360 - 부산 강서구",
    link: `${SITE}/real-estate`,
    description:
      "국토교통부 실거래가 자료로 부산 강서구 아파트·분양권·전월세 거래 내역과 단지별·면적별 가격 추이를 확인하세요.",
  },
  {
    title: "부산 분양정보 | AllView360",
    link: `${SITE}/subscription`,
    description: "청약홈 공고를 바탕으로 부산 지역 청약 중·청약 예정 아파트 분양 정보를 정리합니다.",
  },
  {
    title: "아파트 단지 지도 | AllView360",
    link: `${SITE}/map`,
    description: "명지오션시티, 명지국제신도시, 에코델타시티 아파트 위치와 초등학교 통학구역, 정비구역을 지도에서 확인하세요.",
  },
  {
    title: "부동산 블로그 | AllView360 - 부동산 정보와 강서구 이야기",
    link: `${SITE}/blog`,
    description: "청약, 전세, 면적·평수 계산 등 부동산 정보와 명지·에코델타시티 등 부산 강서구 이야기를 정리한 블로그입니다.",
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cdata(html: string): string {
  return `<![CDATA[${html.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

async function collectItems(): Promise<FeedItem[]> {
  const [posts, descriptions] = await Promise.all([getPublishedPosts(), getComplexDescriptions()]);

  const blogItems: FeedItem[] = posts.map((post) => ({
    title: post.title,
    link: `${SITE}/blog/${encodeURIComponent(post.slug)}`,
    description: post.description,
    image: postThumbnail(post),
    pubDate: new Date(post.createdAt),
  }));

  const complexItems: FeedItem[] = complexData.map((complex) => {
    const fullName = getComplexFullName(complex);
    const raw = descriptions[complex.id];
    const summary = raw
      ? stripHtml(sanitizeDescriptionHtml(raw)).slice(0, 200)
      : `${fullName}(${complex.regionName}) VR 가상투어와 평형별 배치도·평면도 정보`;
    return {
      title: `${fullName} VR 가상투어·평면도 | ${complex.regionName}`,
      link: `${SITE}/vr-tour/${complex.regionId}/${complex.slug}`,
      description: summary,
      image: OG_IMAGE,
      pubDate: COMPLEX_PUB_DATE,
    };
  });

  const pageItems: FeedItem[] = MAIN_PAGES.map((page) => ({ ...page, image: OG_IMAGE, pubDate: PAGES_PUB_DATE }));

  // 최신순 (블로그 글이 위로)
  return [...blogItems, ...complexItems, ...pageItems].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export async function rssResponse(): Promise<Response> {
  const items = await collectItems();

  const itemsXml = items
    .map((item) => {
      const body = `${item.image ? `<img src="${escapeXml(item.image)}" alt="${escapeXml(item.title)}" /><br/>` : ""}<p>${escapeXml(item.description)}</p>`;
      return `<item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${cdata(body)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
    </item>`;
    })
    .join("\n    ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AllView360(올뷰360) - 부동산 정보와 부산 강서구 이야기</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>부동산 블로그와 명지오션시티·명지국제신도시·에코델타시티 아파트 VR투어·단지 소개</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=60",
    },
  });
}
