import type { Metadata } from "next";
import Link from "next/link";
import ToolShell from "@/components/tools/ToolShell";
import BrokerageCalculator from "@/components/tools/BrokerageCalculator";
import { HOUSE_RENT_FEES, HOUSE_SALE_FEES, brokerageFee, wonText } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "부동산 중개수수료 계산기 (매매·전세·월세) | AllView",
  description: "아파트 매매·전세·월세 중개수수료(중개보수) 상한을 바로 계산하세요. 부산광역시 조례 요율, 월세 환산, 부가세까지 반영합니다.",
  alternates: { canonical: "/tools/brokerage-fee" },
};

const range = (lo: number, hi: number) =>
  hi === Infinity ? `${wonText(lo)} 이상` : lo === 0 ? `${wonText(hi)} 미만` : `${wonText(lo)} ~ ${wonText(hi)} 미만`;

function FeeTable({ rows }: { rows: typeof HOUSE_SALE_FEES }) {
  return (
    <table>
      <tbody>
        <tr><th>거래금액</th><th>상한요율</th><th>한도액</th></tr>
        {rows.map(([lo, hi, rate, cap]) => (
          <tr key={lo}><td>{range(lo, hi)}</td><td>{(rate * 100).toFixed(1)}%</td><td>{cap ? wonText(cap) : "없음"}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

const EXAMPLES: [string, number][] = [["매매 3억 원", brokerageFee("house", "sale", 3e8).fee], ["매매 5억 원", brokerageFee("house", "sale", 5e8).fee], ["전세 2억 원", brokerageFee("house", "jeonse", 2e8).fee], ["월세 보증금 1,000만 원 / 월 50만 원", brokerageFee("house", "monthly", 1e7, 5e5).fee]];

export default function BrokerageFeePage() {
  return (
    <ToolShell
      href="/tools/brokerage-fee"
      title="중개수수료 계산기"
      intro="거래 종류와 금액을 넣으면 법정 상한 중개수수료를 바로 계산합니다. 부산광역시 조례 요율을 기준으로 하며, 월세는 환산 거래금액으로 계산합니다."
    >
      <section className="mt-8 rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
        <BrokerageCalculator />
      </section>

      <div className="complex-description mt-10">
        <h2>계산 방법</h2>
        <ul>
          <li><strong>중개수수료 = 거래금액 × 상한요율</strong> (한도액이 있는 구간은 한도액을 넘을 수 없음)</li>
          <li>월세는 <strong>보증금 + 월세 × 100</strong>을 거래금액으로 보고, 이 금액이 5천만 원 미만이면 <strong>보증금 + 월세 × 70</strong>으로 다시 계산합니다.</li>
          <li>상한요율은 최대치이며, 실제 금액은 이 범위 안에서 중개사와 협의합니다. 부가세는 별도입니다.</li>
        </ul>

        <h2>주택 매매 요율표</h2>
        <FeeTable rows={HOUSE_SALE_FEES} />
        <h2>주택 임대차(전세·월세) 요율표</h2>
        <FeeTable rows={HOUSE_RENT_FEES} />
        <p>주거용 오피스텔(전용 85㎡ 이하, 부엌·화장실 등 주거 설비)은 매매 0.5%, 임대차 0.4% 이내이고, 상가·토지 등은 0.9% 이내에서 협의합니다.</p>

        <h2>자주 찾는 금액</h2>
        <table>
          <tbody>
            <tr><th>거래</th><th>상한 중개수수료</th></tr>
            {EXAMPLES.map(([k, v]) => <tr key={k}><td>{k}</td><td>{wonText(v)}</td></tr>)}
          </tbody>
        </table>

        <p>
          요율 근거, 부가세, 분양권 중개수수료 계산법, 초과 수수료 신고 방법은{" "}
          <Link href={`/blog/${encodeURIComponent("부동산-중개수수료-계산법")}`}>부동산 중개수수료 계산법</Link>에 자세히 정리했습니다.
          집을 살 때 함께 내는 세금은 <Link href="/tools/acquisition-tax">취득세 계산기</Link>로 확인하세요.
        </p>
      </div>
    </ToolShell>
  );
}
