"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { X } from "lucide-react";

interface Props {
  level: "sido" | "sgg";
  code: string;
  name: string;
  onClose: () => void;
}

interface SeriesPoint {
  date: string;
  value: number;
}

interface IndexApiResponse {
  name: string;
  saleIndex: SeriesPoint[];
  jeonseIndex: SeriesPoint[];
  saleIndexNational: SeriesPoint[];
  jeonseIndexNational: SeriesPoint[];
}

interface RatioApiResponse {
  name: string;
  ratio: SeriesPoint[];
  ratioNational: SeriesPoint[];
}

interface IndexChartPoint {
  date: string;
  sale?: number;
  jeonse?: number;
  saleNational?: number;
  jeonseNational?: number;
}

interface RatioChartPoint {
  date: string;
  value?: number;
  national?: number;
}

function IndexTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = (key: string) => payload.find((p) => p.dataKey === key)?.value;
  const sale = val("sale");
  const jeonse = val("jeonse");
  const saleNational = val("saleNational");
  const jeonseNational = val("jeonseNational");
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-3 text-xs space-y-0.5">
      <p className="text-gray-600 mb-1">{label}</p>
      {sale !== undefined && <p className="text-accent font-bold">매매지수 {sale.toFixed(2)}</p>}
      {jeonse !== undefined && <p className="text-emerald-500 font-bold">전세지수 {jeonse.toFixed(2)}</p>}
      {saleNational !== undefined && <p className="text-gray-400 font-semibold">전국 매매지수 {saleNational.toFixed(2)}</p>}
      {jeonseNational !== undefined && <p className="text-gray-400 font-semibold">전국 전세지수 {jeonseNational.toFixed(2)}</p>}
    </div>
  );
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

export default function RegionIndexChart({ level, code, name, onClose }: Props) {
  const [indexData, setIndexData] = useState<IndexApiResponse | null>(null);
  const [ratioData, setRatioData] = useState<RatioApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setIndexData(null);
    setRatioData(null);
    Promise.all([
      fetch(`/api/kb-index?level=${level}&code=${code}`).then((r) => r.json()),
      fetch(`/api/kb-ratio?level=${level}&code=${code}`).then((r) => r.json()),
    ])
      .then(([idx, ratio]) => {
        setIndexData(idx);
        setRatioData(ratio.error ? null : ratio);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [level, code]);

  const indexChartData: IndexChartPoint[] = (() => {
    if (!indexData) return [];
    const map = new Map<string, IndexChartPoint>();
    for (const p of indexData.saleIndex) map.set(p.date, { date: p.date, sale: p.value });
    for (const p of indexData.jeonseIndex) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.jeonse = p.value;
      map.set(p.date, existing);
    }
    for (const p of indexData.saleIndexNational) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.saleNational = p.value;
      map.set(p.date, existing);
    }
    for (const p of indexData.jeonseIndexNational) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.jeonseNational = p.value;
      map.set(p.date, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const ratioChartData: RatioChartPoint[] = (() => {
    if (!ratioData) return [];
    const map = new Map<string, RatioChartPoint>();
    for (const p of ratioData.ratio) map.set(p.date, { date: p.date, value: p.value });
    for (const p of ratioData.ratioNational) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.national = p.value;
      map.set(p.date, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  return (
    <div className="h-[80vh] flex flex-col bg-bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-bg-hover text-gray-700 hover:text-gray-900 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {loading && <div className="flex-1 flex items-center justify-center text-sm text-muted">불러오는 중...</div>}

      {!loading && (
        <div className="flex-1 min-h-0 flex flex-col gap-6">
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-sm font-semibold text-gray-900 shrink-0">매매·전세지수</p>
            <p className="text-xs text-muted mb-2 shrink-0">최근 10년 · 주간 KB 시계열, 점선은 전국 평균 (특정 시점=100 기준)</p>
            {indexChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
            ) : (
              <>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={indexChartData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval={50} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={45} domain={["auto", "auto"]} />
                      <Tooltip content={<IndexTooltip />} />
                      <Line type="monotone" dataKey="saleNational" stroke="#a5b4fc" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                      <Line type="monotone" dataKey="jeonseNational" stroke="#6ee7b7" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                      <Line type="monotone" dataKey="sale" stroke="#5b6ef5" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
                      <Line type="monotone" dataKey="jeonse" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-5 mt-2 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 bg-accent" />
                    <span className="text-xs text-muted">매매지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 bg-emerald-500" />
                    <span className="text-xs text-muted">전세지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#a5b4fc" }} />
                    <span className="text-xs text-muted">전국 매매지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#6ee7b7" }} />
                    <span className="text-xs text-muted">전국 전세지수</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-sm font-semibold text-gray-900 shrink-0">아파트 매매전세비</p>
            <p className="text-xs text-muted mb-2 shrink-0">최근 10년 · 월간 KB 시계열, 점선은 전국 평균 (매매가 대비 전세가 비율)</p>
            {ratioChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
            ) : (
              <>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratioChartData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval={10} />
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
        </div>
      )}
    </div>
  );
}
