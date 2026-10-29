"use client";

import { useState } from "react";
import { brokerageFee, pct, wonText, type DealKind, type PropertyKind } from "@/lib/calculators";
import { Choice, MoneyInput, ResultBox, Toggle } from "@/components/tools/CalcFields";

export default function BrokerageCalculator() {
  const [kind, setKind] = useState<PropertyKind>("house");
  const [deal, setDeal] = useState<DealKind>("sale");
  const [amount, setAmount] = useState(3e8);
  const [monthly, setMonthly] = useState(0);
  const [vat, setVat] = useState(false);

  const r = brokerageFee(kind, deal, amount, monthly);
  const vatAmount = vat ? Math.floor(r.fee * 0.1) : 0;

  const rows: [string, string][] = [];
  if (deal === "monthly") rows.push(["환산 거래금액", `${wonText(r.base)} (보증금 + 월세×${r.multiplier})`]);
  rows.push(["상한요율", kind === "other" ? `${pct(r.rate)} 이내 협의` : pct(r.rate)]);
  if (r.cap) rows.push(["한도액", wonText(r.cap)]);
  rows.push(["중개수수료 (부가세 제외)", wonText(r.fee)]);
  if (vat) rows.push(["부가가치세 10%", wonText(vatAmount)]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Choice
          label="부동산 종류"
          value={kind}
          onChange={setKind}
          options={[
            { value: "house", label: "주택(아파트)" },
            { value: "officetel", label: "주거용 오피스텔" },
            { value: "other", label: "상가·토지 등" },
          ]}
        />
        <Choice
          label="거래 종류"
          value={deal}
          onChange={setDeal}
          options={[
            { value: "sale", label: "매매" },
            { value: "jeonse", label: "전세" },
            { value: "monthly", label: "월세" },
          ]}
        />
        <MoneyInput label={deal === "sale" ? "매매가" : deal === "jeonse" ? "전세 보증금" : "월세 보증금"} value={amount} onChange={setAmount} />
        {deal === "monthly" && <MoneyInput label="월세" value={monthly} onChange={setMonthly} />}
        <Toggle label="부가세 포함해서 보기" desc="일반과세자 중개사무소는 수수료의 10%가 별도로 붙을 수 있습니다." checked={vat} onChange={setVat} />
      </div>
      <ResultBox
        totalLabel={vat ? "부가세 포함 상한 중개수수료" : "상한 중개수수료"}
        total={wonText(r.fee + vatAmount)}
        rows={rows}
        note="매도인과 매수인(임대인과 임차인)이 각각 내는 금액의 상한입니다. 실제 금액은 이 범위 안에서 중개사와 협의해 정합니다."
      />
    </div>
  );
}
