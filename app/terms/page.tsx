import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout, { InfoSection, InfoList } from "@/components/legal/InfoPageLayout";
import { CONTACT_EMAIL, POLICY_EFFECTIVE_DATE, SITE_NAME } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "이용약관 | AllView360(올뷰360)",
  description: "AllView360(올뷰360) 서비스 이용에 관한 약관입니다.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPageLayout title="이용약관" updated={POLICY_EFFECTIVE_DATE}>
      <InfoSection title="제1조 (목적)">
        <p>
          이 약관은 {SITE_NAME}(이하 &apos;사이트&apos;)가 제공하는 부동산 정보 서비스(이하 &apos;서비스&apos;)의 이용 조건과
          절차, 사이트와 이용자의 권리·의무 및 책임 사항을 정하는 것을 목적으로 합니다.
        </p>
      </InfoSection>

      <InfoSection title="제2조 (서비스의 내용)">
        <p>사이트는 다음 서비스를 무료로 제공합니다.</p>
        <InfoList
          items={[
            "아파트 단지 VR투어, 배치도·평면도, 단지 소개 정보",
            "공공데이터 기반 실거래가 및 분양 정보",
            "단지 위치·학구도 등 지도 정보, 부동산 뉴스",
            "가게 홍보 정보 및 문의하기",
          ]}
        />
      </InfoSection>

      <InfoSection title="제3조 (정보의 정확성과 책임의 한계)">
        <InfoList
          items={[
            "사이트가 제공하는 정보는 공공데이터, 입주자모집공고, 공개된 자료 등을 바탕으로 정리한 참고 자료이며, 실제와 다르거나 최신 상태가 아닐 수 있습니다.",
            "단지 소개 글에 포함된 거주 후기는 인터넷에 공개된 의견을 정리한 것으로, 개인의 경험과 주관이 담겨 있습니다.",
            "이용자는 부동산 거래·계약 등 중요한 결정을 내리기 전에 관계 기관, 공인중개사 등을 통해 정보를 직접 확인해야 하며, 사이트는 제공 정보를 이용해 발생한 손해에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.",
            "사이트는 시스템 점검, 외부 데이터 제공 중단 등 불가피한 사유로 서비스 전부 또는 일부를 일시 중단할 수 있습니다.",
          ]}
        />
      </InfoSection>

      <InfoSection title="제4조 (저작권)">
        <p>
          사이트가 직접 제작한 VR투어 영상·이미지, 단지 소개 글 등 콘텐츠의 저작권은 사이트에 있습니다. 이용자는 사이트의
          사전 동의 없이 이를 복제, 배포, 전송, 2차 가공하여 상업적으로 이용할 수 없습니다. 공공데이터 등 외부 자료의 권리는
          각 원 저작권자에게 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="제5조 (이용자의 의무)">
        <InfoList
          items={[
            "타인의 정보를 도용하거나 허위 내용으로 문의하는 행위",
            "자동화된 수단으로 사이트 콘텐츠를 대량 수집하는 행위",
            "서비스 운영을 방해하거나 사이트 및 제3자의 권리를 침해하는 행위",
          ]}
        />
        <p>이용자는 위 행위를 해서는 안 되며, 위반 시 서비스 이용이 제한될 수 있습니다.</p>
      </InfoSection>

      <InfoSection title="제6조 (광고)">
        <p>
          사이트는 서비스 운영을 위해 화면에 광고를 게재할 수 있습니다. 광고를 통해 이루어지는 거래는 이용자와 광고주 사이의
          일이며, 사이트는 그에 대해 책임을 지지 않습니다.
        </p>
      </InfoSection>

      <InfoSection title="제7조 (개인정보 보호)">
        <p>
          사이트는 관련 법령에 따라 이용자의 개인정보를 보호하며, 자세한 내용은{" "}
          <Link href="/privacy" className="text-accent hover:underline">개인정보처리방침</Link>에 따릅니다.
        </p>
      </InfoSection>

      <InfoSection title="제8조 (약관의 변경)">
        <p>
          사이트는 필요한 경우 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 시행일 7일 전부터
          사이트에 공지합니다.
        </p>
      </InfoSection>

      <InfoSection title="문의">
        <p>
          약관에 관한 문의는{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a> 또는{" "}
          <Link href="/contact" className="text-accent hover:underline">문의 페이지</Link>를 이용해 주세요.
        </p>
      </InfoSection>

      <p className="text-sm text-muted">부칙: 이 약관은 {POLICY_EFFECTIVE_DATE}부터 시행합니다.</p>
    </InfoPageLayout>
  );
}
