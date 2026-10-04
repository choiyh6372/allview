import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout, { InfoSection } from "@/components/legal/InfoPageLayout";
import { POLICY_EFFECTIVE_DATE } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "데이터 출처 | AllView360(올뷰360)",
  description: "AllView360(올뷰360)에서 사용하는 실거래가, 분양정보, 단지 정보, 학구도, 지도 등 공공데이터와 외부 서비스의 출처를 안내합니다.",
  alternates: { canonical: "/credits" },
};

type Source = { name: string; provider: string; use: string; via: string };

const PUBLIC_DATA: Source[] = [
  {
    name: "아파트 매매·전월세 실거래가",
    provider: "국토교통부",
    use: "실거래가 페이지, 지도 거래내역, 월간 실거래가 글",
    via: "공공데이터포털(data.go.kr) 실거래가 공개 API",
  },
  {
    name: "분양권·입주권 전매 실거래가",
    provider: "국토교통부",
    use: "실거래가 페이지(분양권)",
    via: "공공데이터포털(data.go.kr)",
  },
  {
    name: "오피스텔·연립다세대 매매·전월세 실거래가",
    provider: "국토교통부",
    use: "지도 거래내역",
    via: "공공데이터포털(data.go.kr)",
  },
  {
    name: "공동주택 단지 목록·기본정보",
    provider: "국토교통부 (공동주택관리정보시스템 K-apt)",
    use: "단지 세대수·동수·주차대수·사용승인연도 등",
    via: "공공데이터포털(data.go.kr)",
  },
  {
    name: "청약홈 분양정보",
    provider: "한국부동산원",
    use: "분양정보 페이지, 단지 소개의 주택형·공급 세대수",
    via: "공공데이터포털(data.go.kr)",
  },
  {
    name: "정비사업 현황",
    provider: "부산광역시",
    use: "지도의 재개발·재건축 정비구역 정보",
    via: "공공데이터포털(data.go.kr)",
  },
  {
    name: "부동산 공매 물건 정보",
    provider: "한국자산관리공사 (온비드)",
    use: "지도의 공매 물건 정보",
    via: "공공데이터포털(data.go.kr)",
  },
  {
    name: "초등학교 통학구역(학구도)",
    provider: "교육부·부산광역시교육청",
    use: "지도의 학구도, 단지별 배정 초등학교 안내",
    via: "학구도 공간정보",
  },
];

const SERVICES: { name: string; use: string }[] = [
  { name: "카카오맵 API (Kakao)", use: "지도 표시, 주소·좌표 검색" },
  { name: "Cloudflare R2", use: "이미지·데이터 저장" },
  { name: "Vercel", use: "웹사이트 호스팅" },
];

export default function CreditsPage() {
  return (
    <InfoPageLayout
      title="데이터 출처"
      description="AllView360은 공공데이터와 외부 서비스를 활용해 정보를 제공합니다."
      updated={POLICY_EFFECTIVE_DATE}
    >
      <InfoSection title="공공데이터">
        <p>
          아래 공공데이터는 각 제공 기관이 공개한 자료를 공공데이터포털 등을 통해 받아 가공·시각화한 것이며, 이용 조건에 따라
          출처를 표시합니다. 원본 데이터의 권리는 각 제공 기관에 있습니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-bg-card text-left">
                <th className="border border-border px-3 py-2 font-semibold">데이터</th>
                <th className="border border-border px-3 py-2 font-semibold">제공 기관</th>
                <th className="border border-border px-3 py-2 font-semibold">사용하는 곳</th>
              </tr>
            </thead>
            <tbody>
              {PUBLIC_DATA.map((s) => (
                <tr key={s.name}>
                  <td className="border border-border px-3 py-2 align-top">
                    <span className="font-medium text-gray-900">{s.name}</span>
                    <br />
                    <span className="text-xs text-muted">{s.via}</span>
                  </td>
                  <td className="border border-border px-3 py-2 align-top whitespace-nowrap">{s.provider}</td>
                  <td className="border border-border px-3 py-2 align-top">{s.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted">
          공공데이터는 제공 기관의 갱신 주기와 신고 시점에 따라 실제와 차이가 있을 수 있습니다. 예를 들어 실거래가는 계약 후
          30일 이내에 신고되므로 최근 거래는 나중에 추가될 수 있습니다. 중요한 결정 전에는 각 기관의 원본 자료를 확인하세요.
        </p>
      </InfoSection>

      <InfoSection title="자체 제작 콘텐츠">
        <p>
          단지별 360° VR투어 영상·이미지와 단지 소개 글, 블로그 글은 AllView360이 직접 제작했습니다. 무단 복제·배포를
          금하며, 자세한 내용은 <Link href="/terms" className="text-accent hover:underline">이용약관</Link>을 참고하세요.
          단지 소개 글 중 거주 후기를 정리한 부분은 인터넷에 공개된 의견을 재구성한 것으로, 해당 부분에 따로 표시했습니다.
        </p>
      </InfoSection>

      <InfoSection title="외부 서비스">
        <ul className="list-disc pl-5 space-y-1.5">
          {SERVICES.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> — {s.use}
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title="출처 관련 문의">
        <p>
          출처 표기에 오류가 있거나 권리 관련 문의가 있으시면{" "}
          <Link href="/contact" className="text-accent hover:underline">문의 페이지</Link>로 알려주세요. 확인 후 바로
          수정하겠습니다.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
