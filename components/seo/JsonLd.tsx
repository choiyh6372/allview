// 검색엔진용 구조화 데이터(JSON-LD)

const BASE = "https://www.allview.kr";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** 경로 표시: [이름, 경로] 목록 (홈은 자동으로 맨 앞에 붙음) */
export function BreadcrumbJsonLd({ items }: { items: [name: string, path: string][] }) {
  const all: [string, string][] = [["홈", "/"], ...items];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: all.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${BASE}${path}` })),
      }}
    />
  );
}

/** 홈: 사이트·운영 주체 정보 */
export function SiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${BASE}/#website`,
            url: BASE,
            name: "AllView360(올뷰360)",
            inLanguage: "ko-KR",
            publisher: { "@id": `${BASE}/#organization` },
          },
          {
            "@type": "Organization",
            "@id": `${BASE}/#organization`,
            name: "AllView360",
            alternateName: "올뷰360",
            url: BASE,
            description: "부산 강서구 명지오션시티·명지국제신도시·에코델타시티 아파트 VR투어, 실거래가, 분양정보를 제공하는 부동산 정보 플랫폼",
            areaServed: "부산광역시 강서구",
          },
        ],
      }}
    />
  );
}
