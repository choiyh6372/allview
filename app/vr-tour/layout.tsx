import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아파트 VR·평면도 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
  description: "부산 강서구 아파트 단지를 360° VR 또는 평면도로 확인하고, 평형별 구조와 단지 정보를 비교하세요.",
  keywords: "아파트 평면도, VR투어, 가상투어, 명지오션시티, 명지국제신도시, 에코델타시티, 부산 강서구",
  alternates: { canonical: "/vr-tour" },
  openGraph: {
    title: "아파트 VR·평면도 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
    description: "부산 강서구 아파트 단지를 360° VR 또는 평면도로 확인하고, 평형별 구조와 단지 정보를 비교하세요.",
    url: "https://www.allview.kr/vr-tour",
    images: [
      {
        url: "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function VRTourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
