"use client";

import { useState, useEffect } from "react";
import ComplexList from "@/components/real-estate/ComplexList";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import { type Complex } from "@/lib/realEstateData";
import { fetchAptTrade, fetchSilvTrade, buildComplexList } from "@/lib/aptTradeApi";
import StoreBanner from "@/components/home/StoreBanner";

type TradeType = "apt" | "silv";
type LoadState = "loading" | "ready";

const TAB_LABELS: Record<TradeType, string> = {
  apt: "아파트",
  silv: "분양권",
};

export default function RealEstatePage() {
  const [activeTab, setActiveTab] = useState<TradeType>("apt");
  const [aptComplexes, setAptComplexes] = useState<Complex[]>([]);
  const [silvComplexes, setSilvComplexes] = useState<Complex[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<number | null>(null);
  const [selectedSilvId, setSelectedSilvId] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [aptItems, silvItems] = await Promise.all([
        fetchAptTrade("26440", 12),
        fetchSilvTrade("26440", 12),
      ]);
      if (cancelled) return;

      const aptList = buildComplexList(aptItems);
      const silvList = buildComplexList(silvItems);
      setAptComplexes(aptList);
      setSilvComplexes(silvList);
      setSelectedAptId(aptList[0]?.id ?? null);
      setSelectedSilvId(silvList[0]?.id ?? null);
      setLoadState("ready");
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const complexes = activeTab === "apt" ? aptComplexes : silvComplexes;
  const selectedId = activeTab === "apt" ? selectedAptId : selectedSilvId;
  const setSelectedId = activeTab === "apt" ? setSelectedAptId : setSelectedSilvId;
  const complex = complexes.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">실거래가 조회</h1>
            <p className="text-gray-400">국토교통부 실거래 데이터 기반 · 최근 12개월</p>
          </div>
          <DataBadge state={loadState} count={complexes.length} />
        </div>

        {/* 탭 */}
        <div className="flex gap-1 p-1 mb-6 bg-bg-card border border-border rounded-xl w-fit">
          {(["apt", "silv"] as TradeType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-accent text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <ComplexList
              complexes={complexes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              isLoading={loadState === "loading"}
            />
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            {complex ? (
              <>
                <PriceChart complex={complex} />
                <TransactionTable complex={complex} />
              </>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-muted">
                {loadState === "loading" ? "데이터 로딩 중..." : "단지를 선택해주세요"}
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreBanner />
    </>
  );
}

function DataBadge({ state, count }: { state: LoadState; count: number }) {
  if (state === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted border border-border rounded-lg px-3 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
        데이터 로딩 중
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-green-400 border border-green-400/20 bg-green-400/5 rounded-lg px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      국토부 실거래 데이터 · {count}개 단지
    </span>
  );
}
