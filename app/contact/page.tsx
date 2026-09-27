import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, MessageSquare } from "lucide-react";
import InquiryModal from "@/components/home/InquiryModal";
import InfoPageLayout, { InfoSection, InfoList } from "@/components/legal/InfoPageLayout";
import { CONTACT_EMAIL } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "문의하기 | AllView360(올뷰360)",
  description: "AllView360(올뷰360) 서비스 이용, 정보 수정 요청, 제휴·광고 문의 안내입니다.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPageLayout title="문의하기" description="서비스 이용, 정보 수정 요청, 제휴·광고 문의를 받고 있습니다.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
            <Mail size={18} className="text-accent" /> 이메일
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent font-semibold hover:underline break-all">
            {CONTACT_EMAIL}
          </a>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
            <Clock size={18} className="text-accent" /> 응대 시간
          </div>
          <p>평일 09:00 – 18:00 (주말·공휴일 제외)</p>
        </div>
      </div>

      <InfoSection title="사이트에서 바로 문의하기">
        <p className="flex items-center gap-2">
          <MessageSquare size={16} className="text-accent shrink-0" />
          이름, 연락처, 문의 내용을 남겨주시면 확인 후 연락드리겠습니다.
        </p>
        <InquiryModal />
      </InfoSection>

      <InfoSection title="이런 문의를 받고 있어요">
        <InfoList
          items={[
            "단지 정보, 평면도, VR투어 내용의 오류 신고 및 수정 요청",
            "새로운 단지의 VR투어 촬영·등록 요청",
            "가게 홍보 등록 및 제휴·광고 문의",
            "서비스 이용 중 불편 사항",
          ]}
        />
        <p className="text-sm text-muted">
          문의 시 수집하는 개인정보의 처리에 관한 내용은{" "}
          <Link href="/privacy" className="text-accent hover:underline">개인정보처리방침</Link>에서 확인할 수 있습니다.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
