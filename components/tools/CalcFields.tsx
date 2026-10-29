"use client";

import { wonText } from "@/lib/calculators";

// 계산기 공통 입력 요소

/** 금액 입력: 만원 단위로 입력받아 원 단위로 돌려준다 */
export function MoneyInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (won: number) => void;
  hint?: string;
}) {
  const manwon = value ? String(Math.round(value / 1e4)) : "";
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</span>
      <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-accent">
        <input
          inputMode="numeric"
          value={manwon ? Number(manwon).toLocaleString("ko-KR") : ""}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
            onChange(Number.isNaN(n) ? 0 : n * 1e4);
          }}
          placeholder="0"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-right text-base font-semibold text-gray-900 outline-none"
        />
        <span className="shrink-0 whitespace-nowrap pr-3 text-sm text-muted">만원</span>
      </div>
      <span className="block mt-1 text-xs text-muted text-right">{value ? wonText(value) : hint ?? " "}</span>
    </label>
  );
}

/** 버튼형 선택지 */
export function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</span>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-2 py-2 rounded-lg text-sm font-medium break-keep transition-colors ${
              value === o.value ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:border-accent/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 체크박스 */
export function Toggle({ label, checked, onChange, desc }: { label: string; checked: boolean; onChange: (v: boolean) => void; desc?: string }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#5b6ef5]" />
      <span>
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        {desc && <span className="block text-xs text-muted">{desc}</span>}
      </span>
    </label>
  );
}

/** 결과 표 */
export function ResultBox({ rows, total, totalLabel, note }: { rows: [string, string][]; total: string; totalLabel: string; note?: string }) {
  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5">
      <p className="text-sm text-gray-600">{totalLabel}</p>
      <p className="mt-1 text-3xl font-black text-gray-900">{total}</p>
      <dl className="mt-4 space-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-gray-600">{k}</dt>
            <dd className="font-semibold text-gray-900 text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-3 text-xs text-muted leading-relaxed">{note}</p>}
    </div>
  );
}
