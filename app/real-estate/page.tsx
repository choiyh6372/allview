"use client";

import { useState, useEffect, useCallback } from "react";
import ComplexList from "@/components/real-estate/ComplexList";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import { complexData, type Complex } from "@/lib/realEstateData";
import {
  fetchAptTrade,
  filterByKeywords,
  toTransaction,
  buildMonthlyPrices,
  type RawItem,
} from "@/lib/aptTradeApi";
import StoreBanner from "@/components/home/StoreBanner";

export type DataSource = "loading" | "real" | "empty";

function enrichComplex(base: Complex, allItems: RawItem[]): {
  complex: Complex;
  source: DataSource;
} {
  const keywords = base.aptKeywords ?? [];
  const matched = filterByKeywords(allItems, keywords);

  if (matched.length === 0) {
    return { complex: base, source: "empty" };
  }

  const transactions = matched
    .map(toTransaction)
    .filter((t) => t.price > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);

  const monthlyPrices = buildMonthlyPrices(matched, 24);

  return {
    complex: { ...base, transactions, monthlyPrices },
    source: "real",
  };
}

export default function RealEstatePage() {
  const [selectedId, setSelectedId] = useState(complexData[0].id);
  const [enriched, setEnriched] = useState<Map<number, Complex>>(
    () => new Map(complexData.map((c) => [c.id, c]))
  );
  const [sources, setSources] = useState<Map<number, DataSource>>(
    () => new Map(complexData.map((c) => [c.id, "loading" as DataSource]))
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const allItems = await fetchAptTrade("26440", 12);

      if (cancelled) return;

      const newEnriched = new Map<number, Complex>();
      const newSources = new Map<number, DataSource>();

      for (const base of complexData) {
        const { complex, source } = enrichComplex(base, allItems);
        newEnriched.set(base.id, complex);
        newSources.set(base.id, source);
      }

      setEnriched(newEnriched);
      setSources(newSources);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const complex = enriched.get(selectedId) ?? complexData[0];
  const source = sources.get(selectedId) ?? "empty";

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">실거래가 조회</h1>
            <p className="text-gray-400">국토교통부 실거래 데이터 기반 · 최근 12개월</p>
          </div>
          <DataBadge source={source} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <ComplexList
              complexes={complexData}
              selectedId={selectedId}
              onSelect={setSelectedId}
              sources={sources}
            />
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            <PriceChart complex={complex} source={source} />
            <TransactionTable complex={complex} source={source} />
          </div>
        </div>
      </div>

      <StoreBanner />
    </>
  );
}

function DataBadge({ source }: { source: DataSource }) {
  if (source === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted border border-border rounded-lg px-3 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
        데이터 로딩 중
      </span>
    );
  }
  if (source === "real") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400 border border-green-400/20 bg-green-400/5 rounded-lg px-3 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        국토부 실거래 데이터
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400 border border-border rounded-lg px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      거래 데이터 없음
    </span>
  );
}
