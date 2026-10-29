import type { Metadata } from "next";
import Link from "next/link";
import ToolShell from "@/components/tools/ToolShell";
import AcquisitionTaxCalculator from "@/components/tools/AcquisitionTaxCalculator";
import { acquisitionTax, pct, wonText } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "아파트 취득세 계산기 (1주택·다주택·생애최초) | AllView",
  description: "아파트 취득세를 바로 계산하세요. 집값 구간별 세율, 다주택 중과, 생애최초 감면, 지방교육세·농어촌특별세까지 합계로 보여드립니다.",
  alternates: { canonical: "/tools/acquisition-tax" },
};

const base = { over85: false, houses: 1 as const, regulated: false, temporary: false, firstHome: false };
const EXAMPLES = [3e8, 5e8, 7e8, 1e9].map((price) => ({ price, r: acquisitionTax({ ...base, price }), r85: acquisitionTax({ ...base, price, over85: true }) }));

export default function AcquisitionTaxPage() {
  return (
    <ToolShell
      href="/tools/acquisition-tax"
      title="취득세 계산기"
      intro="취득가액과 주택 수를 넣으면 취득세와 지방교육세, 농어촌특별세를 합친 금액을 계산합니다. 부산처럼 비조정대상지역은 2주택까지 일반세율이 적용됩니다."
    >
      <section className="mt-8 rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
        <AcquisitionTaxCalculator />
      </section>

      <div className="complex-description mt-10">
        <h2>1주택 취득세율</h2>
        <table>
          <tbody>
            <tr><th>취득가액</th><th>취득세</th><th>지방교육세</th><th>농특세 (85㎡ 초과)</th></tr>
            <tr><td>6억 원 이하</td><td>1%</td><td>0.1%</td><td>0.2%</td></tr>
            <tr><td>6억 원 초과 ~ 9억 원 이하</td><td>(취득가액(억) × 2/3 − 3)%</td><td>취득세율의 1/10</td><td>0.2%</td></tr>
            <tr><td>9억 원 초과</td><td>3%</td><td>0.3%</td><td>0.2%</td></tr>
          </tbody>
        </table>

        <h2>다주택 중과세율</h2>
        <table>
          <tbody>
            <tr><th>주택 수 (새 집 포함)</th><th>조정대상지역</th><th>비조정대상지역</th></tr>
            <tr><td>1주택</td><td>1~3%</td><td>1~3%</td></tr>
            <tr><td>2주택</td><td>8% (일시적 2주택은 1~3%)</td><td>1~3%</td></tr>
            <tr><td>3주택</td><td>12%</td><td>8%</td></tr>
            <tr><td>4주택 이상</td><td>12%</td><td>12%</td></tr>
          </tbody>
        </table>
        <p>중과세율이 적용되면 지방교육세는 0.4%, 85㎡ 초과 농특세는 8%일 때 0.6%, 12%일 때 1.0%입니다.</p>

        <h2>금액별 취득세 (1주택)</h2>
        <table>
          <tbody>
            <tr><th>취득가액</th><th>세율</th><th>85㎡ 이하</th><th>85㎡ 초과</th></tr>
            {EXAMPLES.map(({ price, r, r85 }) => (
              <tr key={price}><td>{wonText(price)}</td><td>{pct(r.rate)}</td><td>{wonText(r.total)}</td><td>{wonText(r85.total)}</td></tr>
            ))}
          </tbody>
        </table>

        <h2>생애최초 감면</h2>
        <p>
          본인과 배우자 모두 주택을 소유한 적이 없는 사람이 12억 원 이하 주택을 처음 사면 취득세에서 최대 200만 원을 감면합니다.
          3개월 안에 전입해야 하고 3년 안에 팔거나 임대하면 추징됩니다. 행정안전부 2026년 지방세제 개편안(청년 300만 원, 오피스텔 포함)은 국회 통과 전입니다.
        </p>

        <p>
          세율 근거, 일시적 2주택, 분양권 취득세, 신고·납부 방법은{" "}
          <Link href={`/blog/${encodeURIComponent("아파트-취득세-계산법")}`}>아파트 취득세 계산법</Link>에 정리했습니다.
          중개수수료는 <Link href="/tools/brokerage-fee">중개수수료 계산기</Link>로 함께 확인하세요.
        </p>
      </div>
    </ToolShell>
  );
}
