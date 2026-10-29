"use client";

import { useState } from "react";
import { acquisitionTax, pct, wonText } from "@/lib/calculators";
import { Choice, MoneyInput, ResultBox, Toggle } from "@/components/tools/CalcFields";

export default function AcquisitionTaxCalculator() {
  const [price, setPrice] = useState(3e8);
  const [over85, setOver85] = useState(false);
  const [houses, setHouses] = useState<1 | 2 | 3 | 4>(1);
  const [regulated, setRegulated] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [firstHome, setFirstHome] = useState(false);

  const r = acquisitionTax({ price, over85, houses, regulated, temporary, firstHome });

  const rows: [string, string][] = [
    ["적용 세율", `${pct(r.rate)}${r.heavy ? " (다주택 중과)" : ""}`],
    ["취득세", wonText(r.tax)],
  ];
  if (r.relief) rows.push(["생애최초 감면 (취득세)", `−${wonText(r.relief)}`]);
  rows.push(["지방교육세", wonText(r.edu)]);
  if (r.eduRelief) rows.push(["생애최초 감면 (지방교육세)", `−${wonText(r.eduRelief)}`]);
  rows.push(["농어촌특별세", over85 ? wonText(r.farm) : "비과세 (85㎡ 이하)"]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <MoneyInput label="취득가액 (매매가·분양가)" value={price} onChange={setPrice} />
        <Choice
          label="전용면적"
          value={over85 ? "over" : "under"}
          onChange={(v) => setOver85(v === "over")}
          options={[
            { value: "under", label: "85㎡ 이하" },
            { value: "over", label: "85㎡ 초과" },
          ]}
        />
        <Choice
          label="이 집을 포함한 세대 주택 수"
          value={houses}
          onChange={(v) => { setHouses(v); if (v !== 1) setFirstHome(false); }}
          options={[
            { value: 1, label: "1주택" },
            { value: 2, label: "2주택" },
            { value: 3, label: "3주택" },
            { value: 4, label: "4주택 이상" },
          ]}
        />
        <Toggle label="새 집이 조정대상지역" desc="부산은 2022년 9월 해제 이후 비조정대상지역입니다." checked={regulated} onChange={setRegulated} />
        {houses === 2 && regulated && (
          <Toggle label="일시적 2주택 (기존 집을 기한 안에 처분)" checked={temporary} onChange={setTemporary} />
        )}
        {houses === 1 && (
          <Toggle label="생애최초 주택 구입" desc="본인·배우자 모두 주택을 소유한 적이 없고 12억 원 이하 (최대 200만 원 감면)" checked={firstHome} onChange={setFirstHome} />
        )}
      </div>
      <ResultBox
        totalLabel="납부할 세금 합계"
        total={wonText(r.total)}
        rows={rows}
        note={
          r.firstHomeIneligible
            ? "생애최초 감면은 취득가액 12억 원 이하 주택에만 적용되어 감면을 빼고 계산했습니다."
            : "취득일(잔금일 또는 등기일 중 빠른 날)부터 60일 안에 신고·납부합니다. 생애최초 감면을 받으면 지방교육세도 같은 비율로 줄어듭니다."
        }
      />
    </div>
  );
}
