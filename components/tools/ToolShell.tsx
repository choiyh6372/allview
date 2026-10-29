import Link from "next/link";
import { AlertTriangle, Calculator } from "lucide-react";
import { CALC_BASIS } from "@/lib/calculators";

export const TOOLS = [
  { href: "/tools/brokerage-fee", title: "중개수수료 계산기", desc: "매매·전세·월세 상한 중개보수와 부가세" },
  { href: "/tools/acquisition-tax", title: "취득세 계산기", desc: "1주택·다주택·생애최초, 지방교육세·농특세 포함" },
  { href: "/tools/rent-conversion", title: "전월세 전환 계산기", desc: "전세↔월세 전환, 법정 전환율 확인" },
];

/** 계산기 페이지 공통 틀: 제목·도구 탭·본문·기준 안내 */
export default function ToolShell({
  href,
  title,
  intro,
  children,
}: {
  href: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-accent/10 text-accent"><Calculator size={22} /></span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h1>
      </div>
      <p className="mt-3 text-gray-600 leading-relaxed">{intro}</p>

      <nav className="mt-6 grid grid-cols-3 gap-2" aria-label="계산기 선택">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-2 py-2.5 rounded-lg text-center text-sm font-semibold break-keep ${
              t.href === href ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:border-accent/40"
            }`}
          >
            {t.title.replace(" 계산기", "")}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5">
        <AlertTriangle size={22} className="shrink-0 text-amber-600 mt-0.5" />
        <p className="text-sm sm:text-base font-medium text-gray-900 leading-relaxed">
          {CALC_BASIS.asOf} 시행 기준으로 계산하며, 실제 금액은 개별 사정과 법령 개정에 따라 달라질 수 있습니다.
          계약·신고 전에는 관할 기관과 전문가에게 확인하세요. <strong>세무·법률 자문이 아닙니다.</strong>
        </p>
      </div>

      {children}
    </div>
  );
}
