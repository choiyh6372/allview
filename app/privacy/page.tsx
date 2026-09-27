import type { Metadata } from "next";
import InfoPageLayout, { InfoSection, InfoList } from "@/components/legal/InfoPageLayout";
import {
  CONTACT_EMAIL,
  INQUIRY_RETENTION_MONTHS,
  POLICY_EFFECTIVE_DATE,
  SITE_NAME,
  SITE_OPERATOR,
} from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "개인정보처리방침 | AllView360(올뷰360)",
  description: "AllView360(올뷰360)의 개인정보 수집·이용, 쿠키 및 광고, 이용자 권리에 관한 안내입니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout title="개인정보처리방침" updated={POLICY_EFFECTIVE_DATE}>
      <p>
        {SITE_NAME}(이하 &apos;사이트&apos;)는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를
        안전하게 보호하기 위해 다음과 같이 개인정보처리방침을 정하여 공개합니다.
      </p>

      <InfoSection title="1. 수집하는 개인정보 항목과 수집 방법">
        <p>사이트는 회원가입 없이 이용할 수 있으며, 다음의 경우에만 개인정보를 수집합니다.</p>
        <InfoList
          items={[
            <>
              <strong>문의하기 이용 시</strong>: 이름, 연락처(휴대전화번호), 문의 내용 — 이용자가 문의 양식에 직접 입력
            </>,
            <>
              <strong>서비스 이용 과정에서 자동 수집</strong>: 접속 기록, 브라우저·기기 정보, 쿠키 — 서비스 안정성
              확보와 이용 통계, 광고 제공을 위해 자동으로 생성·수집될 수 있습니다.
            </>,
          ]}
        />
      </InfoSection>

      <InfoSection title="2. 개인정보의 이용 목적">
        <InfoList
          items={[
            "문의 내용 확인 및 답변, 요청 사항 처리",
            "서비스 이용 통계 분석과 품질 개선",
            "부정 이용 방지 및 서비스 안정성 확보",
            "맞춤형 또는 비맞춤형 광고 제공(광고 게재 시)",
          ]}
        />
      </InfoSection>

      <InfoSection title="3. 보유 및 이용 기간">
        <p>
          문의하기로 수집한 개인정보는 <strong>접수일로부터 {INQUIRY_RETENTION_MONTHS}개월</strong>간 보관한 뒤 자동으로
          파기합니다. 그 전에 문의 처리가 완료되었거나 이용자가 삭제를 요청하는 경우에는 즉시 파기합니다. 다만 관련 법령에
          따라 보존이 필요한 경우에는 해당 기간 동안 보관합니다.
        </p>
      </InfoSection>

      <InfoSection title="4. 개인정보의 제3자 제공">
        <p>
          사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관이 적법한 절차에
          따라 요청하는 경우에는 예외로 합니다.
        </p>
      </InfoSection>

      <InfoSection title="5. 개인정보 처리의 위탁 및 국외 이전">
        <p>사이트는 서비스 운영을 위해 다음 업체의 클라우드 서비스를 이용하며, 이 과정에서 정보가 국외 서버에 저장될 수 있습니다.</p>
        <InfoList
          items={[
            <>
              <strong>Vercel Inc.</strong>(미국) — 웹사이트 호스팅 및 접속 통계
            </>,
            <>
              <strong>Cloudflare, Inc.</strong>(미국) — 문의 내용 등 데이터 저장(R2 스토리지)
            </>,
            <>
              <strong>Google LLC</strong>(미국) — 광고 게재(Google 애드센스, 광고 게재 시)
            </>,
          ]}
        />
        <p>이전되는 항목은 위 1항의 정보이며, 서비스 이용 기간 동안 네트워크를 통해 전송·보관됩니다.</p>
      </InfoSection>

      <InfoSection title="6. 쿠키와 광고">
        <p>
          사이트는 이용 통계와 광고 제공을 위해 쿠키를 사용할 수 있습니다. 쿠키는 웹사이트가 이용자의 브라우저에 보내는
          작은 텍스트 파일로, 이용자의 컴퓨터에 저장됩니다.
        </p>
        <InfoList
          items={[
            "Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이 사이트 또는 다른 웹사이트 방문 기록을 바탕으로 광고를 게재할 수 있습니다.",
            "Google은 광고 쿠키를 사용하여 이용자의 이 사이트 및 인터넷의 다른 사이트 방문 기록에 기반한 광고를 이용자에게 제공할 수 있습니다.",
            <>
              이용자는{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 해제할 수 있으며,{" "}
              <a
                href="https://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                www.aboutads.info
              </a>
              에서 제3자 사업자의 맞춤 광고용 쿠키 사용을 거부할 수 있습니다.
            </>,
            "브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.",
          ]}
        />
        <p>
          Google의 데이터 사용 방식은{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Google 파트너 사이트 데이터 사용 정책
          </a>
          에서 확인할 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="7. 개인정보의 파기 절차와 방법">
        <p>
          보유 기간이 끝났거나 처리 목적을 달성한 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는
          방법으로 영구 삭제합니다.
        </p>
      </InfoSection>

      <InfoSection title="8. 이용자의 권리와 행사 방법">
        <p>
          이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 아래 연락처로
          요청하시면 지체 없이 조치하겠습니다.
        </p>
      </InfoSection>

      <InfoSection title="9. 개인정보의 안전성 확보 조치">
        <InfoList
          items={[
            "관리자 페이지 접근 시 비밀번호 인증을 적용하고 접근 권한을 운영자로 제한",
            "전송 구간 암호화(HTTPS) 적용",
            "필요 최소한의 정보만 수집",
          ]}
        />
      </InfoSection>

      <InfoSection title="10. 개인정보 보호책임자">
        <InfoList
          items={[
            <>책임자: {SITE_OPERATOR}</>,
            <>
              이메일:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                {CONTACT_EMAIL}
              </a>
            </>,
          ]}
        />
        <p className="text-sm text-muted">
          개인정보 침해에 대한 신고나 상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118),
          개인정보분쟁조정위원회(www.kopico.go.kr, 1833-6972)에 문의할 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="11. 방침의 변경">
        <p>
          이 개인정보처리방침은 {POLICY_EFFECTIVE_DATE}부터 적용됩니다. 내용이 추가·삭제·수정되는 경우 시행 7일 전부터
          사이트를 통해 알립니다.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
