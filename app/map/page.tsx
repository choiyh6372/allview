import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "단지 지도 | AllView - 부산 강서구 부동산 통합 플랫폼",
  description: "명지오션시티, 명지국제신도시, 에코델타시티 아파트 단지 위치를 지도로 확인하세요.",
};

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap"), { ssr: false });

export default function MapPage() {
  const apiKey = process.env.KAKAO_MAP_KEY ?? "";
  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <KakaoMap apiKey={apiKey} />
    </div>
  );
}
