"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  level: "sido" | "sgg";
  code: string;
}

interface SeriesPoint {
  date: string;
  value: number;
}

interface RatioApiResponse {
  name: string;
  ratio: SeriesPoint[];
  ratioNational: SeriesPoint[];
}

interface RatioChartPoint {
  date: string;
  value?: number;
  national?: number;
}

const YEARS_TO_SHOW = 2;

function filterRecentYears<T extends { date: string }>(sorted: T[], years: number): T[] {
  if (sorted.length === 0) return sorted;
  const latest = new Date(sorted[sorted.length - 1].date);
  const cutoff = new Date(latest);
  cutoff.setFullYear(cutoff.getFullYear() - years);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return sorted.filter((p) => p.date >= cutoffStr);
}

function RatioTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = (key: string) => payload.find((p) => p.dataKey === key)?.value;
  const value = val("value");
  const national = val("national");
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-3 text-xs space-y-0.5">
      <p className="text-gray-600 mb-1">{label}</p>
      {value !== undefined && <p className="text-orange-500 font-bold">매매전세비 {value.toFixed(1)}%</p>}
      {national !== undefined && <p className="text-gray-400 font-semibold">전국 매매전세비 {national.toFixed(1)}%</p>}
    </div>
  );
}

export default function RegionRatioChart({ level, code }: Props) {
  const [ratioData, setRatioData] = useState<RatioApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setLoading(true);
    setRatioData(null);
    fetch(`/api/kb-ratio?level=${level}&code=${code}`)
      .then((r) => r.json())
      .then((ratio) => setRatioData(ratio.error ? null : ratio))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [level, code]);

  const ratioChartData: RatioChartPoint[] = (() => {
    if (!ratioData) return [];
    const map = new Map<string, RatioChartPoint>();
    for (const p of ratioData.ratio) map.set(p.date, { date: p.date, value: p.value });
    for (const p of ratioData.ratioNational) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.national = p.value;
      map.set(p.date, existing);
    }
    const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    return filterRecentYears(sorted, YEARS_TO_SHOW);
  })();

  return (
    <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
      <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">아파트 매매전세비</p>
      {loading ? (
        <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted">불러오는 중...</div>
      ) : ratioChartData.length === 0 ? (
        <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
      ) : (
        <>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratioChartData} margin={{ top: 5, right: 10, left: 0, bottom: isMobile ? 25 : 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 10, ...(isMobile ? { textAnchor: "end" } : {}) }}
                  tickLine={false}
                  axisLine={false}
                  interval={10}
                  angle={isMobile ? -45 : 0}
                  height={isMobile ? 45 : 30}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<RatioTooltip />} />
                <Line type="monotone" dataKey="national" stroke="#fdba74" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-orange-500" />
              <span className="text-xs text-muted">매매전세비</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#fdba74" }} />
              <span className="text-xs text-muted">전국 매매전세비</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
