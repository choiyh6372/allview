import type { Metadata } from "next";
import { getActiveStores } from "@/lib/promotionStore";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const stores = await getActiveStores();
  const hasStores = stores.length > 0;

  return {
    title: "가게 홍보 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
    description: "명지오션시티, 명지국제신도시, 에코델타시티 입주 단지 주변 가게를 업종별·지역별로 찾아보세요.",
    keywords: "명지오션시티 맛집, 명지국제신도시 카페, 에코델타시티 가게, 부산 강서구 상가, 가게홍보, 입주민 혜택",
    alternates: { canonical: "/store" },
    // 비어 있는 홍보 목록은 검색 결과에는 노출하지 않되, 사이트 내부 링크 탐색은 허용한다.
    robots: hasStores ? undefined : { index: false, follow: true },
    openGraph: {
      title: "가게 홍보 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
      description: "명지오션시티, 명지국제신도시, 에코델타시티 입주 단지 주변 가게를 업종별·지역별로 찾아보세요.",
      url: "https://www.allview.kr/store",
      images: [
        {
          url: "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
