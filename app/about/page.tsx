import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout, { InfoSection, InfoList } from "@/components/legal/InfoPageLayout";

export const metadata: Metadata = {
  title: "사이트 소개 | AllView360(올뷰360) - 부산 강서구 부동산 통합 플랫폼",
  description:
    "AllView360(올뷰360)은 부산 강서구 명지오션시티·명지국제신도시·에코델타시티 아파트의 VR투어, 평면도, 실거래가, 분양정보를 한곳에서 제공하는 부동산 정보 플랫폼입니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="사이트 소개"
      description="AllView360(올뷰360)은 부산 강서구 아파트 정보를 한곳에 모은 부동산 정보 플랫폼입니다."
    >
      <InfoSection title="AllView360은 어떤 곳인가요">
        <p>
          AllView360(올뷰360)은 부산 강서구의 명지오션시티, 명지국제신도시, 에코델타시티 아파트 단지를
          직접 가보지 않고도 자세히 살펴볼 수 있도록 만든 부동산 정보 플랫폼입니다. 이사나 내 집 마련을
          준비하는 분들이 여러 사이트를 오가지 않아도 단지 구조, 거래 흐름, 주변 환경을 한 번에 비교할 수
          있도록 정보를 정리하고 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="제공하는 서비스">
        <InfoList
          items={[
            <>
              <Link href="/vr-tour" className="text-accent font-semibold hover:underline">VR투어</Link> — 단지별·평형별
              실내를 360° VR로 둘러보고, 단지 배치도와 평면도, 단지 소개 글을 함께 확인할 수 있습니다.
            </>,
            <>
              <Link href="/real-estate" className="text-accent font-semibold hover:underline">실거래가</Link> — 국토교통부
              실거래가 공개 자료를 바탕으로 단지별 매매·전월세 거래 내역을 보여줍니다.
            </>,
            <>
              <Link href="/subscription" className="text-accent font-semibold hover:underline">분양정보</Link> — 청약홈
              공고를 바탕으로 부산 지역 청약 중·청약 예정 단지를 정리합니다.
            </>,
            <>
              <Link href="/map" className="text-accent font-semibold hover:underline">지도보기</Link> — 단지 위치,
              초등학교 통학구역, 정비구역 등을 지도에서 확인할 수 있습니다.
            </>,
            <>
              <Link href="/blog" className="text-accent font-semibold hover:underline">부동산 블로그</Link> — 청약,
              학군, 교통 계획 등 강서구 부동산 정보를 직접 정리한 글을 올립니다.
            </>,
          ]}
        />
      </InfoSection>

      <InfoSection title="정보의 출처">
        <p>
          실거래가와 분양 정보는 국토교통부 실거래가 공개시스템, 한국부동산원 청약홈 등 공공데이터를 활용하며,
          단지 기본 정보는 공동주택관리정보시스템(K-apt) 자료와 입주자모집공고를 참고합니다. 초등학교 통학구역은
          교육청 학구도 자료를 사용합니다. VR투어 콘텐츠는 AllView360이 직접 제작한 것입니다. 자세한 출처는{" "}
          <Link href="/credits" className="text-accent font-semibold hover:underline">데이터 출처</Link> 페이지에서 확인할 수 있습니다.
        </p>
        <p>
          제공되는 정보는 참고용이며, 실제 거래나 계약 전에는 관계 기관과 공인중개사를 통해 반드시 최신 정보를
          확인하시기 바랍니다.
        </p>
      </InfoSection>

      <InfoSection title="문의">
        <p>
          서비스 이용 중 궁금한 점이나 제휴·광고 문의는{" "}
          <Link href="/contact" className="text-accent font-semibold hover:underline">문의 페이지</Link>를 이용해
          주세요.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
