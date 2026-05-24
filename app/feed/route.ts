const OG_IMAGE = "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg";

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
}

const ITEMS: FeedItem[] = [
  {
    title: "AllView(올뷰) - 부산 강서구 부동산 통합 플랫폼",
    link: "https://allview.kr",
    description: `<img src="${OG_IMAGE}" alt="AllView(올뷰) - 부산 강서구 부동산 통합 플랫폼" width="1200" height="630" /><p>AllView(올뷰)는 부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 실거래가, VR 투어, 부동산 뉴스를 한 곳에서 제공하는 통합 부동산 플랫폼입니다. 국토부 실거래가 데이터 기반의 정확한 시세 정보와 인터랙티브 지도를 확인하세요.</p>`,
    pubDate: new Date("2025-01-01"),
  },
  {
    title: "아파트 실거래가 지도 | AllView - 명지오션시티·명지국제신도시·에코델타시티",
    link: "https://allview.kr/map",
    description: `<img src="${OG_IMAGE}" alt="부산 강서구 아파트 실거래가 지도" width="1200" height="630" /><p>부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 실거래가를 지도에서 직접 확인하세요. 단지별 최근 거래 내역, 면적별 평균 가격 차트, 전월세 시세를 인터랙티브 지도로 제공합니다. 국토부 실거래 공개시스템 데이터를 기반으로 최신 정보를 제공합니다.</p>`,
    pubDate: new Date("2025-01-01"),
  },
  {
    title: "아파트 실거래가 분석 | AllView - 부산 강서구",
    link: "https://allview.kr/real-estate",
    description: `<img src="${OG_IMAGE}" alt="부산 강서구 아파트 실거래가 분석" width="1200" height="630" /><p>부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트·분양권·전월세 실거래가를 실시간으로 확인하세요. 지역별·단지별·면적별 가격 추이 차트와 최근 거래 목록을 제공합니다.</p>`,
    pubDate: new Date("2025-01-01"),
  },
  {
    title: "부동산 뉴스 | AllView - 명지오션시티·에코델타시티",
    link: "https://allview.kr/news",
    description: `<img src="${OG_IMAGE}" alt="부산 강서구 부동산 뉴스" width="1200" height="630" /><p>부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 관련 최신 부동산 뉴스를 확인하세요. 분양, 입주, 시세, 개발 계획 등 강서구 부동산 시장의 주요 소식을 한눈에 모아 제공합니다.</p>`,
    pubDate: new Date("2025-01-01"),
  },
  {
    title: "아파트 VR 투어 | AllView - 부산 강서구 신축 아파트",
    link: "https://allview.kr/vr-tour",
    description: `<img src="${OG_IMAGE}" alt="부산 강서구 신축 아파트 VR 투어" width="1200" height="630" /><p>부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 신축 아파트 내부를 VR로 미리 체험하세요. 실제 세대 내부를 360도로 확인하고 인테리어와 구조를 방문 없이 살펴볼 수 있습니다.</p>`,
    pubDate: new Date("2025-01-01"),
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

export async function GET() {
  const itemsXml = ITEMS.map((item) => `<item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
    </item>`).join("\n    ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AllView(올뷰) - 부산 강서구 부동산 통합 플랫폼</title>
    <link>https://allview.kr</link>
    <description>부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 실거래가, VR 투어, 부동산 뉴스</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=60",
    },
  });
}
