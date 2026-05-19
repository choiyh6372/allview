"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import type { Complex } from "@/lib/realEstateData";
import { Eye } from "lucide-react";

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}억`;
  return `${v.toLocaleString()}만`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-muted mb-1">{label}</p>
      <p className="text-white font-bold">중위 {fmt(payload[0]?.value)}</p>
      {payload[1] && <p className="text-gray-400">최저 {fmt(payload[1]?.value)}</p>}
      {payload[2] && <p className="text-gray-400">최고 {fmt(payload[2]?.value)}</p>}
    </div>
  );
};

interface Props {
  complex: Complex;
}

export default function PriceChart({ complex }: Props) {
  const [selectedArea, setSelectedArea] = useState(complex.areas[0]);
  const data = complex.monthlyPrices;
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const change = latest && prev ? ((latest.median - prev.median) / prev.median) * 100 : 0;

  return (
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
              onClick={() => setSelectedArea(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedArea === a
                  ? "bg-accent text-white"
                  : "bg-bg-hover border border-border text-gray-400 hover:text-white"
              }`}
            >
              {a}㎡
            </button>
          ))}

          {/* data source badge */}
          {/* VR button */}
          {complex.vrUrl && (
            <a
              href="/vr-tour"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-white rounded-lg text-xs font-medium transition-all"
            >
              <Eye size={13} />
              VR 보기
            </a>
          )}
        </div>
      </div>

      {data.length === 0 && (
        <div className="h-60 flex items-center justify-center text-sm text-muted">
          거래 데이터가 없습니다
        </div>
      )}

      <ResponsiveContainer width="100%" height={data.length === 0 ? 0 : 240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b6ef5" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#5b6ef5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="high"
            stroke="transparent"
            fill="url(#rangeGrad)"
            name="최고"
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="transparent"
            fill="#0f1117"
            name="최저"
          />
          <Line
            type="monotone"
            dataKey="median"
            stroke="#5b6ef5"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#5b6ef5" }}
            name="중위"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#3a3d5e"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            name="최저"
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#3a3d5e"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            name="최고"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-accent" />
          <span className="text-xs text-muted">중위값</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-[#3a3d5e] border-dashed" style={{ borderTop: "1px dashed #3a3d5e" }} />
          <span className="text-xs text-muted">범위 (최저·최고)</span>
        </div>
      </div>

    </div>
  );
}
