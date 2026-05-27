import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VR 가상투어 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
  description: "명지오션시티, 명지국제신도시, 에코델타시티 아파트 단지를 360° VR로 미리 체험해보세요.",
  keywords: "VR투어, 가상투어, 360도 투어, 명지오션시티, 명지국제신도시, 에코델타시티, 아파트 VR, 부산 강서구",
  openGraph: {
    title: "VR 가상투어 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
    description: "명지오션시티, 명지국제신도시, 에코델타시티 아파트 단지를 360° VR로 미리 체험해보세요.",
    url: "https://allview.kr/vr-tour",
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
