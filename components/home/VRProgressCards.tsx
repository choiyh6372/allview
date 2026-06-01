"use client";

import { useEffect, useState } from "react";

interface RegionStat {
  id: string;
  label: string;
  total: number;
  available: number;
}

export default function VRProgressCards() {
  const [stats, setStats] = useState<RegionStat[]>([]);

  useEffect(() => {
    fetch("/api/vr-stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (stats.length === 0) return null;

  return (
    <>
      {/* 모바일: 버튼 아래 가로 행 */}
      <div className="lg:hidden mt-12 flex flex-col gap-3">
        {stats.map((r) => {
          const pct = r.total > 0 ? Math.round((r.available / r.total) * 100) : 0;
          return (
            <div key={r.id} className="p-3 rounded-xl bg-bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-900 truncate">{r.label}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-600/10 px-1 py-0.5 rounded ml-1 shrink-0">VR</span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-hover mb-2">
                <div className="h-1.5 rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">{r.total > 0 ? `${r.available}/${r.total}` : "준비중"}</span>
                <span className="text-xs font-semibold text-accent">{r.total > 0 ? `${pct}%` : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PC: 오른쪽 절대 위치 세로 배치 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 pr-8">
        {stats.map((r) => {
          const pct = r.total > 0 ? Math.round((r.available / r.total) * 100) : 0;
          return (
            <div key={r.id} className="w-72 p-4 rounded-xl bg-bg-card border border-border backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">{r.label}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-600/10 px-1.5 py-0.5 rounded">VR</span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-hover mb-2">
                <div className="h-1.5 rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  {r.total > 0 ? `${r.available} / ${r.total} 평형` : "준비중"}
                </span>
                <span className="text-sm font-semibold text-accent">
                  {r.total > 0 ? `${pct}%` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
