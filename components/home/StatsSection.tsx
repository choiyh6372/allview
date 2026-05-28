"use client";

import { useEffect, useState } from "react";

interface SiteStats {
  vrComplexes: number;
  vrTypes: number;
  transactions: number;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR");
}

export default function StatsSection() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [storeCount, setStoreCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/site-stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data: unknown[]) => setStoreCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  const items = [
    {
      value: stats ? fmt(stats.vrComplexes) : "—",
      unit: "개 단지",
      label: "VR 단지",
    },
    {
      value: stats ? fmt(stats.vrTypes) : "—",
      unit: "개 평형",
      label: "VR 평형",
    },
    {
      value: stats ? fmt(stats.transactions) : "—",
      unit: "건",
      label: "실거래 (최근 5년)",
    },
    {
      value: storeCount !== null ? fmt(storeCount) : "—",
      unit: "개",
      label: "등록 가게",
    },
  ];

  return (
    <section className="py-16 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span
                  className={`text-3xl sm:text-4xl font-black text-accent transition-opacity ${
                    stats ? "opacity-100" : "opacity-30"
                  }`}
                >
                  {s.value}
                </span>
                <span className="text-sm text-muted mb-1">{s.unit}</span>
              </div>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
