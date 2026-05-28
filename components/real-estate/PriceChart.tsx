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

function CustomTooltip({ active, payload, label, light }: any) {
  if (!active || !payload?.length) return null;
  const val = (key: string) => payload.find((p: any) => p.dataKey === key)?.value as number | undefined;
  const median = val("median");
  const low = val("low");
  const high = val("high");
  const rentMedian = val("rentMedian");
  if (median === undefined && rentMedian === undefined) return null;
  return (
    <div className={`${light ? "bg-white border-gray-200 shadow-md" : "bg-bg-card border-border shadow-xl"} border rounded-xl p-3 text-xs`}>
      <p className={`${light ? "text-gray-500" : "text-muted"} mb-1`}>{label}</p>
      {median !== undefined && (
        <>
          <p className={`${light ? "text-gray-900" : "text-white"} font-bold`}>매매 {fmt(median)}</p>
          {low !== undefined && <p className="text-gray-400">최저 {fmt(low)}</p>}
          {high !== undefined && <p className="text-gray-400">최고 {fmt(high)}</p>}
        </>
      )}
      {rentMedian !== undefined && (
        <p className="text-emerald-500 font-bold mt-1">전세 {fmt(rentMedian)}</p>
      )}
    </div>
  );
}

interface Props {
  complex: Complex;
  rentItems: RentRawItem[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
  hideVrButton?: boolean;
  light?: boolean;
  naverUrl?: string;
  areaCols?: 4 | 7;
}

export default function PriceChart({ complex, rentItems, selectedArea, onAreaChange, hideVrButton, light, naverUrl, areaCols = 4 }: Props) {
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
    ? jeonseItems.filter((i) => String(parseFloat(i.excluUseAr ?? "0")) === selectedArea)
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

  const gridColor = light ? "#e5e7eb" : "#2a2d3e";
  const areaFill  = light ? "#ffffff" : "#0f1117";
  const tickColor = light ? "#6b7280" : "#6b7280";

  return (
    <>
    <div className={`${light ? "bg-white border-gray-200" : "bg-bg-card border-border"} border rounded-2xl p-6`}>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className={`text-lg font-bold ${light ? "text-gray-900" : "text-white"}`}>{complex.name}</h2>
          <div className="flex items-center gap-2">
            {naverUrl && (
              <a
                href={naverUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-5 py-1.5 bg-[#03C75A] hover:bg-[#02b350] text-white rounded-lg text-xs font-semibold transition-colors"
              >
                네이버 부동산
              </a>
            )}
            {!hideVrButton && complex.vrInfo && (
              <button
                onClick={() => setShowVR(true)}
                className="shrink-0 flex items-center gap-1.5 px-7 py-1.5 bg-accent text-white hover:bg-accent/80 rounded-lg text-xs font-semibold transition-all"
              >
                <Eye size={12} />
                VR 보기
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black ${light ? "text-gray-900" : "text-white"}`}>{fmt(latest?.median ?? 0)}</span>
          <span className={`text-sm font-semibold ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
          </span>
        </div>
        <p className={`text-xs mt-0.5 ${light ? "text-gray-500" : "text-muted"}`}>전월 대비 · 중위 거래가</p>
      </div>

      <div className={`grid gap-2 mb-6 ${areaCols === 7 ? "grid-cols-7" : "grid-cols-4"}`}>
        {complex.areas.map((a) => (
          <button
            key={a}
            onClick={() => onAreaChange(a)}
            className={`py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
              selectedArea === a
                ? "bg-accent text-white"
                : light
                ? "bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900"
                : "bg-bg-hover border border-border text-gray-400 hover:text-white"
            }`}
          >
            {a}㎡
          </button>
        ))}
      </div>

      {chartData.length === 0 && (
        <div className={`h-60 flex items-center justify-center text-sm ${light ? "text-gray-400" : "text-muted"}`}>
          거래 데이터가 없습니다
        </div>
      )}

      <ResponsiveContainer width="100%" height={chartData.length === 0 ? 0 : 260}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b6ef5" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#5b6ef5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y + 4}
                fill={tickColor}
                fontSize={10}
                textAnchor="end"
                transform={`rotate(-45, ${x}, ${y + 4})`}
              >
                {payload.value}
              </text>
            )}
            tickLine={false}
            axisLine={false}
            interval={5}
            height={50}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={55}
            domain={[(dataMin: number) => Math.round(dataMin * 0.95 / 100) * 100, "auto"]}
          />
          <Tooltip content={<CustomTooltip light={light} />} />
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
            fill={areaFill}
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
          <span className={`text-xs ${light ? "text-gray-500" : "text-muted"}`}>매매 중위</span>
        </div>
        {rentData.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-emerald-500" />
            <span className={`text-xs ${light ? "text-gray-500" : "text-muted"}`}>전세 중위</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-3 rounded-sm opacity-30" style={{ background: "linear-gradient(to bottom, #5b6ef5, transparent)" }} />
          <span className={`text-xs ${light ? "text-gray-500" : "text-muted"}`}>범위</span>
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
  ocean: "명지오션시티",
  kukje: "명지국제신도시",
  ecodelta: "에코델타시티",
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
