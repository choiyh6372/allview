"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, ComposedChart, LineChart, BarChart, Line, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { X } from "lucide-react";
import RegionRatioChart from "@/components/market/RegionRatioChart";

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

interface SupplyApiResponse {
  name: string;
  bySido: boolean;
  buyIndex: SeriesPoint[];
  jeonseSupplyIndex: SeriesPoint[];
  buyIndexNational: SeriesPoint[];
  jeonseSupplyIndexNational: SeriesPoint[];
}

interface SupplyChartPoint {
  date: string;
  buy?: number;
  jeonseSupply?: number;
  buyNational?: number;
  jeonseSupplyNational?: number;
}

interface IndexChartPoint {
  date: string;
  sale?: number;
  jeonse?: number;
  saleNational?: number;
  jeonseNational?: number;
  saleChange?: number;
  jeonseChange?: number;
}

interface WeeklyRegionEntry {
  code: string;
  name: string;
  latest: number | null;
}
interface WeeklyApiResponse {
  sido: {
    saleChange: { regions: WeeklyRegionEntry[] };
    jeonseChange: { regions: WeeklyRegionEntry[] };
  };
}

interface RankPoint {
  code: string;
  name: string;
  value: number;
}

function buildRanking(regions: WeeklyRegionEntry[]): RankPoint[] {
  return regions
    .filter((r): r is WeeklyRegionEntry & { latest: number } => r.latest !== null)
    .map((r) => ({ code: r.code, name: r.name, value: r.latest }))
    .sort((a, b) => b.value - a.value);
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

function changeColor(value: number | undefined): string {
  return (value ?? 0) >= 0 ? "#f87171" : "#60a5fa";
}

// 증감 막대가 0을 기준으로 차트 중앙에서 위/아래로 뻗어나가도록 좌우 대칭 도메인 계산
function symmetricDomain(values: (number | undefined)[]): [number, number] {
  const maxAbs = values.reduce<number>((acc, v) => Math.max(acc, Math.abs(v ?? 0)), 0.01);
  return [-maxAbs, maxAbs];
}

function IndexTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = (key: string) => payload.find((p) => p.dataKey === key)?.value;
  const sale = val("sale");
  const jeonse = val("jeonse");
  const saleNational = val("saleNational");
  const jeonseNational = val("jeonseNational");
  const saleChange = val("saleChange");
  const jeonseChange = val("jeonseChange");
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-3 text-xs space-y-0.5">
      <p className="text-gray-600 mb-1">{label}</p>
      {sale !== undefined && <p className="text-accent font-bold">매매지수 {sale.toFixed(2)}</p>}
      {jeonse !== undefined && <p className="text-emerald-500 font-bold">전세지수 {jeonse.toFixed(2)}</p>}
      {saleNational !== undefined && <p className="text-gray-400 font-semibold">전국 매매지수 {saleNational.toFixed(2)}</p>}
      {jeonseNational !== undefined && <p className="text-gray-400 font-semibold">전국 전세지수 {jeonseNational.toFixed(2)}</p>}
      {saleChange !== undefined && (
        <p className={saleChange >= 0 ? "text-red-500 font-semibold" : "text-blue-500 font-semibold"}>
          매매증감 {saleChange >= 0 ? "+" : ""}{saleChange.toFixed(2)}%
        </p>
      )}
      {jeonseChange !== undefined && (
        <p className={jeonseChange >= 0 ? "text-red-500 font-semibold" : "text-blue-500 font-semibold"}>
          전세증감 {jeonseChange >= 0 ? "+" : ""}{jeonseChange.toFixed(2)}%
        </p>
      )}
    </div>
  );
}

function SupplyTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = (key: string) => payload.find((p) => p.dataKey === key)?.value;
  const buy = val("buy");
  const jeonseSupply = val("jeonseSupply");
  const buyNational = val("buyNational");
  const jeonseSupplyNational = val("jeonseSupplyNational");
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-3 text-xs space-y-0.5">
      <p className="text-gray-600 mb-1">{label}</p>
      {buy !== undefined && <p className="text-violet-500 font-bold">매수우위지수 {buy.toFixed(1)}</p>}
      {jeonseSupply !== undefined && <p className="text-teal-500 font-bold">전세수급지수 {jeonseSupply.toFixed(1)}</p>}
      {buyNational !== undefined && <p className="text-gray-400 font-semibold">전국 매수우위지수 {buyNational.toFixed(1)}</p>}
      {jeonseSupplyNational !== undefined && <p className="text-gray-400 font-semibold">전국 전세수급지수 {jeonseSupplyNational.toFixed(1)}</p>}
    </div>
  );
}

function RankTooltip({ active, payload }: { active?: boolean; payload?: { payload: RankPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-3 text-xs space-y-0.5">
      <p className="text-gray-600 mb-1">{point.name}</p>
      <p className={point.value >= 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>
        {point.value >= 0 ? "+" : ""}
        {point.value.toFixed(2)}%
      </p>
    </div>
  );
}

export default function RegionIndexChart({ level, code, name, onClose }: Props) {
  const [indexData, setIndexData] = useState<IndexApiResponse | null>(null);
  const [supplyData, setSupplyData] = useState<SupplyApiResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 전국 시/도 순위는 선택된 지역과 무관하게 항상 동일하므로 최초 1회만 조회
  useEffect(() => {
    fetch("/api/kb-weekly")
      .then((r) => r.json())
      .then((d) => setWeeklyData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setIndexData(null);
    setSupplyData(null);
    Promise.all([
      fetch(`/api/kb-index?level=${level}&code=${code}`).then((r) => r.json()),
      fetch(`/api/kb-supply?level=${level}&code=${code}`).then((r) => r.json()),
    ])
      .then(([idx, supply]) => {
        setIndexData(idx);
        setSupplyData(supply.error ? null : supply);
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
    const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    let prevSale: number | undefined;
    let prevJeonse: number | undefined;
    for (const point of sorted) {
      if (point.sale !== undefined && prevSale !== undefined && prevSale !== 0) {
        point.saleChange = ((point.sale - prevSale) / prevSale) * 100;
      }
      if (point.sale !== undefined) prevSale = point.sale;
      if (point.jeonse !== undefined && prevJeonse !== undefined && prevJeonse !== 0) {
        point.jeonseChange = ((point.jeonse - prevJeonse) / prevJeonse) * 100;
      }
      if (point.jeonse !== undefined) prevJeonse = point.jeonse;
    }
    return filterRecentYears(sorted, YEARS_TO_SHOW);
  })();

  const supplyChartData: SupplyChartPoint[] = (() => {
    if (!supplyData) return [];
    const map = new Map<string, SupplyChartPoint>();
    for (const p of supplyData.buyIndex) map.set(p.date, { date: p.date, buy: p.value });
    for (const p of supplyData.jeonseSupplyIndex) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.jeonseSupply = p.value;
      map.set(p.date, existing);
    }
    for (const p of supplyData.buyIndexNational) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.buyNational = p.value;
      map.set(p.date, existing);
    }
    for (const p of supplyData.jeonseSupplyIndexNational) {
      const existing = map.get(p.date) ?? { date: p.date };
      existing.jeonseSupplyNational = p.value;
      map.set(p.date, existing);
    }
    const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    return filterRecentYears(sorted, YEARS_TO_SHOW);
  })();

  const selectedSidoCode = level === "sido" ? code : code.slice(0, 2);
  const saleRanking = weeklyData ? buildRanking(weeklyData.sido.saleChange.regions) : [];
  const jeonseRanking = weeklyData ? buildRanking(weeklyData.sido.jeonseChange.regions) : [];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-bg-hover text-gray-700 hover:text-gray-900 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {loading && (
        <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted bg-bg-card border border-border rounded-2xl">
          불러오는 중...
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
              <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">매매지수 상승률 순위</p>
              {saleRanking.length === 0 ? (
                <div className="h-72 sm:h-80 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
              ) : (
                <>
                  <div className="h-72 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={saleRanking} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 9 }} tickLine={false} axisLine={false} width={44} interval={0} />
                        <Tooltip content={<RankTooltip />} />
                        <ReferenceLine x={0} stroke="#9ca3af" />
                        <Bar dataKey="value" barSize={9}>
                          {saleRanking.map((entry) => (
                            <Cell
                              key={entry.code}
                              fill={changeColor(entry.value)}
                              fillOpacity={entry.code === selectedSidoCode ? 1 : 0.4}
                              stroke={entry.code === selectedSidoCode ? "#111827" : "none"}
                              strokeWidth={entry.code === selectedSidoCode ? 1 : 0}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted mt-2 shrink-0">직전 주 기준 · 전국 시/도 매매지수 변동률, 진한 막대가 현재 선택 지역</p>
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
              <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">전세지수 상승률 순위</p>
              {jeonseRanking.length === 0 ? (
                <div className="h-72 sm:h-80 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
              ) : (
                <>
                  <div className="h-72 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={jeonseRanking} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 9 }} tickLine={false} axisLine={false} width={44} interval={0} />
                        <Tooltip content={<RankTooltip />} />
                        <ReferenceLine x={0} stroke="#9ca3af" />
                        <Bar dataKey="value" barSize={9}>
                          {jeonseRanking.map((entry) => (
                            <Cell
                              key={entry.code}
                              fill={changeColor(entry.value)}
                              fillOpacity={entry.code === selectedSidoCode ? 1 : 0.4}
                              stroke={entry.code === selectedSidoCode ? "#111827" : "none"}
                              strokeWidth={entry.code === selectedSidoCode ? 1 : 0}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted mt-2 shrink-0">직전 주 기준 · 전국 시/도 전세지수 변동률, 진한 막대가 현재 선택 지역</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
              <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">매매지수</p>
            {indexChartData.length === 0 ? (
              <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
            ) : (
              <>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={indexChartData} margin={{ top: 5, right: 10, left: 0, bottom: isMobile ? 25 : 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280", fontSize: 10, ...(isMobile ? { textAnchor: "end" } : {}) }}
                        tickLine={false}
                        axisLine={false}
                        interval={50}
                        angle={isMobile ? -45 : 0}
                        height={isMobile ? 45 : 30}
                      />
                      <YAxis yAxisId="index" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={45} domain={["auto", "auto"]} />
                      <YAxis
                        yAxisId="change"
                        orientation="right"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        domain={symmetricDomain(indexChartData.map((d) => d.saleChange))}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip content={<IndexTooltip />} />
                      <Bar yAxisId="change" dataKey="saleChange" fillOpacity={0.45} barSize={3}>
                        {indexChartData.map((entry) => (
                          <Cell key={entry.date} fill={changeColor(entry.saleChange)} />
                        ))}
                      </Bar>
                      <Line yAxisId="index" type="monotone" dataKey="saleNational" stroke="#a5b4fc" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                      <Line yAxisId="index" type="monotone" dataKey="sale" stroke="#5b6ef5" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-5 mt-2 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 bg-accent" />
                    <span className="text-xs text-muted">매매지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#a5b4fc" }} />
                    <span className="text-xs text-muted">전국 매매지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "#f87171", opacity: 0.45 }} />
                    <span className="text-xs text-muted">매매증감 상승</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "#60a5fa", opacity: 0.45 }} />
                    <span className="text-xs text-muted">매매증감 하락</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
            <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">전세지수</p>
            {indexChartData.length === 0 ? (
              <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
            ) : (
              <>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={indexChartData} margin={{ top: 5, right: 10, left: 0, bottom: isMobile ? 25 : 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280", fontSize: 10, ...(isMobile ? { textAnchor: "end" } : {}) }}
                        tickLine={false}
                        axisLine={false}
                        interval={50}
                        angle={isMobile ? -45 : 0}
                        height={isMobile ? 45 : 30}
                      />
                      <YAxis yAxisId="index" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={45} domain={["auto", "auto"]} />
                      <YAxis
                        yAxisId="change"
                        orientation="right"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        domain={symmetricDomain(indexChartData.map((d) => d.jeonseChange))}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip content={<IndexTooltip />} />
                      <Bar yAxisId="change" dataKey="jeonseChange" fillOpacity={0.45} barSize={3}>
                        {indexChartData.map((entry) => (
                          <Cell key={entry.date} fill={changeColor(entry.jeonseChange)} />
                        ))}
                      </Bar>
                      <Line yAxisId="index" type="monotone" dataKey="jeonseNational" stroke="#6ee7b7" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                      <Line yAxisId="index" type="monotone" dataKey="jeonse" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-5 mt-2 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 bg-emerald-500" />
                    <span className="text-xs text-muted">전세지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#6ee7b7" }} />
                    <span className="text-xs text-muted">전국 전세지수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "#f87171", opacity: 0.45 }} />
                    <span className="text-xs text-muted">전세증감 상승</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "#60a5fa", opacity: 0.45 }} />
                    <span className="text-xs text-muted">전세증감 하락</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
              <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">매수우위지수</p>
              {supplyChartData.length === 0 ? (
                <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
              ) : (
                <>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={supplyChartData} margin={{ top: 5, right: 10, left: 0, bottom: isMobile ? 25 : 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#6b7280", fontSize: 10, ...(isMobile ? { textAnchor: "end" } : {}) }}
                          tickLine={false}
                          axisLine={false}
                          interval={50}
                          angle={isMobile ? -45 : 0}
                          height={isMobile ? 45 : 30}
                        />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={45} domain={["auto", "auto"]} />
                        <Tooltip content={<SupplyTooltip />} />
                        <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="2 2" />
                        <Line type="monotone" dataKey="buyNational" stroke="#c4b5fd" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                        <Line type="monotone" dataKey="buy" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-5 mt-2 shrink-0 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-violet-500" />
                      <span className="text-xs text-muted">매수우위지수</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#c4b5fd" }} />
                      <span className="text-xs text-muted">전국 매수우위지수</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-4">
              <p className="text-lg font-bold text-gray-900 shrink-0 mb-2">전세수급지수</p>
              {supplyChartData.length === 0 ? (
                <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
              ) : (
                <>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={supplyChartData} margin={{ top: 5, right: 10, left: 0, bottom: isMobile ? 25 : 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#6b7280", fontSize: 10, ...(isMobile ? { textAnchor: "end" } : {}) }}
                          tickLine={false}
                          axisLine={false}
                          interval={50}
                          angle={isMobile ? -45 : 0}
                          height={isMobile ? 45 : 30}
                        />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={45} domain={["auto", "auto"]} />
                        <Tooltip content={<SupplyTooltip />} />
                        <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="2 2" />
                        <Line type="monotone" dataKey="jeonseSupplyNational" stroke="#5eead4" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
                        <Line type="monotone" dataKey="jeonseSupply" stroke="#14b8a6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-5 mt-2 shrink-0 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-teal-500" />
                      <span className="text-xs text-muted">전세수급지수</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#5eead4" }} />
                      <span className="text-xs text-muted">전국 전세수급지수</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <RegionRatioChart level={level} code={code} />
          </div>

        </div>
      )}
    </div>
  );
}
