"use client";

import { useState } from "react";
import { CALC_BASIS, impliedRate, jeonseToMonthly, legalConversionRate, monthlyToJeonse, wonText } from "@/lib/calculators";
import { Choice, MoneyInput, ResultBox } from "@/components/tools/CalcFields";

type Mode = "toMonthly" | "toJeonse" | "check";

export default function RentConversionCalculator() {
  const legal = legalConversionRate();
  const [mode, setMode] = useState<Mode>("toMonthly");
  const [jeonse, setJeonse] = useState(3e8);
  const [deposit, setDeposit] = useState(1e8);
  const [monthly, setMonthly] = useState(9e5);
  const [rateText, setRateText] = useState(String(legal));
  const rate = parseFloat(rateText) || 0;

  const rateInput = (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-900 mb-1.5">전환율 (연 %)</span>
      <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-accent">
        <input
          inputMode="decimal"
          value={rateText}
          onChange={(e) => setRateText(e.target.value.replace(/[^\d.]/g, ""))}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-right text-base font-semibold text-gray-900 outline-none"
        />
        <span className="shrink-0 whitespace-nowrap pr-3 text-sm text-muted">%</span>
      </div>
      <span className="block mt-1 text-xs text-muted text-right">법정 상한 연 {legal}% (기준금리 {CALC_BASIS.baseRate.toFixed(2)}% + 2%p)</span>
    </label>
  );

  let result: { label: string; total: string; rows: [string, string][]; note?: string };
  if (mode === "toMonthly") {
    const m = jeonseToMonthly(jeonse, deposit, rate);
    result = {
      label: "적정 월세",
      total: wonText(m),
      rows: [["줄어드는 보증금", wonText(Math.max(0, jeonse - deposit))], ["적용 전환율", `연 ${rate}%`]],
      note: rate > legal ? `입력한 전환율이 법정 상한(연 ${legal}%)보다 높습니다. 계약 기간 중 전환이라면 상한을 넘을 수 없습니다.` : undefined,
    };
  } else if (mode === "toJeonse") {
    const j = monthlyToJeonse(deposit, monthly, rate);
    result = {
      label: "전세로 바꾸면 보증금",
      total: wonText(j),
      rows: [["늘어나는 보증금", wonText(j - deposit)], ["적용 전환율", `연 ${rate}%`]],
    };
  } else {
    const r = impliedRate(jeonse, deposit, monthly);
    const fair = jeonseToMonthly(jeonse, deposit, legal);
    result = {
      label: "이 계약의 실제 전환율",
      total: r ? `연 ${r.toFixed(2)}%` : "-",
      rows: [["법정 상한", `연 ${legal}%`], ["법정 상한 기준 월세", wonText(fair)]],
      note: r > legal ? `법정 상한보다 높습니다. 기존 계약을 바꾸는 경우라면 월세를 ${wonText(fair)} 이하로 조정해 달라고 요구할 수 있습니다.` : r ? "법정 상한 이내입니다." : undefined,
    };
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Choice
          label="계산 종류"
          value={mode}
          onChange={setMode}
          options={[
            { value: "toMonthly", label: "전세→월세" },
            { value: "toJeonse", label: "월세→전세" },
            { value: "check", label: "전환율 확인" },
          ]}
        />
        {mode !== "toJeonse" && <MoneyInput label="기존 전세 보증금" value={jeonse} onChange={setJeonse} />}
        <MoneyInput label={mode === "toMonthly" ? "새 월세 보증금" : "월세 보증금"} value={deposit} onChange={setDeposit} />
        {mode !== "toMonthly" && <MoneyInput label="월세" value={monthly} onChange={setMonthly} />}
        {mode !== "check" && rateInput}
      </div>
      <ResultBox totalLabel={result.label} total={result.total} rows={result.rows} note={result.note} />
    </div>
  );
}
