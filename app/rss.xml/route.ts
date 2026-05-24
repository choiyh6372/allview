import { NaverNewsItem } from "@/app/api/news/route";

const SEARCH_KEYWORDS = ["명지국제신도시", "명지오션시티", "에코델타시티"];

async function fetchByQuery(
  keyword: string,
  clientId: string,
  clientSecret: string
): Promise<NaverNewsItem[]> {
  const query = encodeURIComponent(keyword);
  const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=100&sort=date`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items as NaverNewsItem[];
  } catch {
    return [];
  }
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function escapeUrl(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  let items: NaverNewsItem[] = [];

  if (clientId && clientSecret) {
    const results = await Promise.all(
      SEARCH_KEYWORDS.map((kw) => fetchByQuery(kw, clientId, clientSecret))
    );
    const seen = new Set<string>();
    items = results
      .flat()
      .filter((item) => {
        const key = item.originallink || item.link;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 50);
  }

  const itemsXml = items.map((item) => {
    const link = escapeUrl(item.originallink || item.link);
    const title = stripHtml(item.title);
    const description = stripHtml(item.description);
    const pubDate = new Date(item.pubDate).toUTCString();
    return `<item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
  }).join("\n    ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>올뷰 - 부산 서부산권 부동산 뉴스</title>
    <link>https://allview.kr</link>
    <description>명지오션시티, 명지국제신도시, 에코델타시티 최신 부동산 뉴스</description>
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
