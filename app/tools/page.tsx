import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { TOOLS } from "@/components/tools/ToolShell";
import { CALC_BASIS } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "부동산 계산기 (중개수수료·취득세·전월세 전환) | AllView",
  description: "아파트를 사고팔거나 전월세 계약할 때 필요한 중개수수료, 취득세, 전월세 전환 금액을 바로 계산하세요.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-accent/10 text-accent"><Calculator size={22} /></span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">부동산 계산기</h1>
      </div>
      <p className="mt-3 text-gray-600 leading-relaxed">
        집을 사고팔거나 전월세 계약을 할 때 실거래가 다음으로 많이 따져 보는 비용을 계산합니다. {CALC_BASIS.asOf} 시행 중인 요율과 세율을 기준으로 합니다.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border border-border bg-bg-card p-5 hover:border-accent/50 transition-colors">
            <span className="block text-lg font-bold text-gray-900">{t.title}</span>
            <span className="block mt-1 text-sm text-gray-600">{t.desc}</span>
          </Link>
        ))}
      </div>

      <div className="complex-description mt-10">
        <h2>집 살 때 드는 비용 한눈에</h2>
        <p>
          아파트를 살 때는 매매가 외에도 <strong>취득세(지방교육세·농특세 포함)</strong>, <strong>중개수수료</strong>, 소유권 이전 등기 비용(법무사 보수 등)이 듭니다.
          예를 들어 3억 원 아파트(85㎡ 이하, 1주택)라면 취득세 약 330만 원과 중개수수료 상한 120만 원을 합쳐 450만 원 정도를 잔금과 함께 준비해야 합니다.
        </p>
        <p>
          사려는 단지의 최근 거래가는 <Link href="/real-estate">실거래가</Link>와 <Link href="/real-estate/kukje">지역별 시세 비교</Link>에서,
          자금 계획과 절차는 <Link href="/blog">블로그</Link>의 계산법 글에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
