import type { Metadata } from "next";
import Link from "next/link";
import ToolShell from "@/components/tools/ToolShell";
import RentConversionCalculator from "@/components/tools/RentConversionCalculator";
import { CALC_BASIS, jeonseToMonthly, legalConversionRate, wonText } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "전월세 전환 계산기 (전세→월세, 법정 전환율) | AllView",
  description: "전세를 월세로, 월세를 전세로 바꿀 때 금액을 계산하고 법정 전월세 전환율 상한을 넘는지 확인하세요.",
  alternates: { canonical: "/tools/rent-conversion" },
};

export default function RentConversionPage() {
  const legal = legalConversionRate();
  const examples: [number, number][] = [[3e8, 2e8], [3e8, 1e8], [2e8, 5e7]];
  return (
    <ToolShell
      href="/tools/rent-conversion"
      title="전월세 전환 계산기"
      intro={`전세 보증금 일부를 월세로 돌릴 때 적정 월세, 월세를 전세로 바꿀 때 보증금, 지금 계약의 전환율이 법정 상한(연 ${legal}%)을 넘는지 계산합니다.`}
    >
      <section className="mt-8 rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
        <RentConversionCalculator />
      </section>

      <div className="complex-description mt-10">
        <h2>계산 공식</h2>
        <ul>
          <li><strong>전세 → 월세</strong>: 월세 = (기존 전세 보증금 − 새 보증금) × 전환율 ÷ 12</li>
          <li><strong>월세 → 전세</strong>: 늘어나는 보증금 = 월세 × 12 ÷ 전환율</li>
          <li><strong>전환율 확인</strong>: 전환율 = 월세 × 12 ÷ (전세 보증금 − 월세 보증금)</li>
        </ul>

        <h2>법정 전월세 전환율</h2>
        <p>
          주택임대차보호법은 계약 기간 중 보증금을 월세로 바꿀 때 전환율 상한을 <strong>연 10%와 한국은행 기준금리 + 연 2%p 중 낮은 비율</strong>로 정합니다.
          {CALC_BASIS.asOf} 현재 기준금리 연 {CALC_BASIS.baseRate.toFixed(2)}%(10월 22일 동결)를 적용하면 <strong>연 {legal}%</strong>입니다. 기준금리가 바뀌면 상한도 함께 바뀝니다.
        </p>

        <h2>전환율 {legal}% 기준 월세 예시</h2>
        <table>
          <tbody>
            <tr><th>기존 전세</th><th>새 보증금</th><th>월세</th></tr>
            {examples.map(([j, d]) => (
              <tr key={`${j}-${d}`}><td>{wonText(j)}</td><td>{wonText(d)}</td><td>{wonText(jeonseToMonthly(j, d, legal))}</td></tr>
            ))}
          </tbody>
        </table>
        <p>
          법정 상한은 계약 기간 중에 전환할 때 적용되며, 새로 계약할 때는 시장 시세에 따라 정해지는 경우가 많습니다.
          자세한 내용은 <Link href={`/blog/${encodeURIComponent("전월세-전환율-계산법")}`}>전월세 전환율 계산법</Link>을,
          월세 중개수수료는 <Link href="/tools/brokerage-fee">중개수수료 계산기</Link>를 참고하세요.
        </p>
      </div>
    </ToolShell>
  );
}
