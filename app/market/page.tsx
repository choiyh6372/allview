import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "전국 시장동향 | AllView360(올뷰360) - 부산 강서구 부동산 통합 플랫폼",
  description: "KB부동산 주간 시계열 데이터로 전국 시/도별 아파트 매매·전세가격 증감률을 지도에서 확인하세요.",
};

const NationwideMarketMap = dynamic(() => import("@/components/market/NationwideMarketMap"), { ssr: false });

export default function MarketPage() {
  const apiKey = process.env.KAKAO_MAP_KEY ?? "";
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">전국 시장동향</h1>
      </div>
      <NationwideMarketMap apiKey={apiKey} />
    </div>
  );
}
