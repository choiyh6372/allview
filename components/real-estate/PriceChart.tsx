"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Complex } from "@/lib/realEstateData";
import type { RentRawItem } from "@/lib/aptTradeApi";
import { buildRentMonthlyPrices } from "@/lib/aptTradeApi";
import { Eye } from "lucide-react";
import VRModal from "@/components/vr-tour/VRModal";
import type { VRComplex } from "@/lib/vrData";

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}억`;
  return `${v.toLocaleString()}만`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = (key: string) => payload.find((p: any) => p.dataKey === key)?.value as number | undefined;
  const median = val("median");
  const low = val("low");
  const high = val("high");
  const rentMedian = val("rentMedian");
  if (median === undefined && rentMedian === undefined) return null;
  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-muted mb-1">{label}</p>
      {median !== undefined && (
        <>
          <p className="text-white font-bold">매매 {fmt(median)}</p>
          {low !== undefined && <p className="text-gray-400">최저 {fmt(low)}</p>}
          {high !== undefined && <p className="text-gray-400">최고 {fmt(high)}</p>}
        </>
      )}
      {rentMedian !== undefined && (
        <p className="text-emerald-400 font-bold mt-1">전세 {fmt(rentMedian)}</p>
      )}
    </div>
  );
};

interface Props {
  complex: Complex;
  rentItems: RentRawItem[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

export default function PriceChart({ complex, rentItems, selectedArea, onAreaChange }: Props) {
  const [showVR, setShowVR] = useState(false);

  useEffect(() => {
    setShowVR(false);
  }, [complex.id]);

  const tradeData =
    (selectedArea && complex.monthlyPricesByArea[selectedArea]) ||
    complex.monthlyPrices;

  const jeonseItems = rentItems.filter(
    (i) => parseInt((i.monthlyRent ?? "0").replace(/,/g, "").trim() || "0") === 0
  );
  const filteredRentItems = selectedArea
    ? jeonseItems.filter((i) => String(Math.round(parseFloat(i.excluUseAr ?? "0"))) === selectedArea)
    : jeonseItems;
  const rentData = buildRentMonthlyPrices(filteredRentItems, 60);

  type ChartPoint = { month: string; median?: number; low?: number; high?: number; rentMedian?: number };
  const chartData = (() => {
    const map = new Map<string, ChartPoint>();
    for (const d of tradeData) map.set(d.month, { ...d });
    for (const r of rentData) {
      const existing = map.get(r.month);
      if (existing) existing.rentMedian = r.median;
      else map.set(r.month, { month: r.month, rentMedian: r.median });
    }
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  const latest = tradeData[tradeData.length - 1];
  const prev = tradeData[tradeData.length - 2];
  const change = latest && prev ? ((latest.median - prev.median) / prev.median) * 100 : 0;

  return (
    <>
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">{complex.name}</h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">{fmt(latest?.median ?? 0)}</span>
            <span className={`text-sm font-semibold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">전월 대비 · 중위 거래가</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* area filter */}
          {complex.areas.map((a) => (
            <button
              key={a}
              onClick={() => onAreaChange(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedArea === a
                  ? "bg-accent text-white"
                  : "bg-bg-hover border border-border text-gray-400 hover:text-white"
              }`}
            >
              {a}㎡
            </button>
          ))}

          {complex.vrInfo && (
            <button
              onClick={() => setShowVR(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-white rounded-lg text-xs font-medium transition-all"
            >
              <Eye size={13} />
              VR 보기
            </button>
          )}
        </div>
      </div>

      {chartData.length === 0 && (
        <div className="h-60 flex items-center justify-center text-sm text-muted">
          거래 데이터가 없습니다
        </div>
      )}

      <ResponsiveContainer width="100%" height={chartData.length === 0 ? 0 : 240}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b6ef5" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#5b6ef5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={5}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={55}
            domain={[(dataMin: number) => Math.round(dataMin * 0.95 / 100) * 100, "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="high"
            stroke="transparent"
            fill="url(#rangeGrad)"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="transparent"
            fill="#0f1117"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="median"
            stroke="#5b6ef5"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#5b6ef5" }}
            name="매매 중위"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="rentMedian"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#10b981" }}
            name="전세 중위"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-accent" />
          <span className="text-xs text-muted">매매 중위</span>
        </div>
        {rentData.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-emerald-500" />
            <span className="text-xs text-muted">전세 중위</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-3 rounded-sm opacity-30" style={{ background: "linear-gradient(to bottom, #5b6ef5, transparent)" }} />
          <span className="text-xs text-muted">범위</span>
        </div>
      </div>

    </div>

    {showVR && complex.vrInfo && (
      <VRModal
        complex={toVRComplex(complex.name, complex.vrInfo)}
        onClose={() => setShowVR(false)}
      />
    )}
    </>
  );
}

const REGION_NAMES: Record<string, string> = {
  ocean: "오션시티",
  kukje: "국제신도시",
};

function toVRComplex(
  name: string,
  vrInfo: { regionId: string; slug: string; types: string[] }
): VRComplex {
  return {
    id: `${vrInfo.regionId}_${vrInfo.slug}`,
    slug: vrInfo.slug,
    name,
    regionId: vrInfo.regionId,
    regionName: REGION_NAMES[vrInfo.regionId] ?? vrInfo.regionId,
    types: vrInfo.types,
  };
}
