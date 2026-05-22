"use client";

import { useState, useEffect } from "react";
import ComplexList from "@/components/real-estate/ComplexList";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import StoreBanner from "@/components/home/StoreBanner";
import { type Complex } from "@/lib/realEstateData";
import { buildRentTransactions } from "@/lib/aptTradeApi";
import type { RentRawItem } from "@/lib/molitApi";

type TradeType = "apt" | "silv";

const TAB_LABELS: Record<TradeType, string> = {
  apt: "아파트",
  silv: "분양권",
};

interface Props {
  aptComplexes: Complex[];
  silvComplexes: Complex[];
  rentItems: RentRawItem[];
}

export default function RealEstateClient({ aptComplexes, silvComplexes, rentItems }: Props) {
  const [activeTab, setActiveTab] = useState<TradeType>("apt");
  const [selectedAptId, setSelectedAptId] = useState<number | null>(aptComplexes[0]?.id ?? null);
  const [selectedSilvId, setSelectedSilvId] = useState<number | null>(silvComplexes[0]?.id ?? null);
  const [selectedArea, setSelectedArea] = useState("");

  const complexes = activeTab === "apt" ? aptComplexes : silvComplexes;
  const selectedId = activeTab === "apt" ? selectedAptId : selectedSilvId;
  const setSelectedId = activeTab === "apt" ? setSelectedAptId : setSelectedSilvId;
  const complex = complexes.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    setSelectedArea(complex?.areas[0] ?? "");
  }, [complex?.id]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">실거래가 조회</h1>
            <p className="text-gray-400">국토교통부 실거래 데이터 기반 · 최근 5년</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-400 border border-green-400/20 bg-green-400/5 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            국토부 실거래 데이터 · {complexes.length}개 단지
          </span>
        </div>

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

        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          <aside className="lg:w-64 flex-shrink-0">
            <ComplexList
              complexes={complexes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              isLoading={false}
            />
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            {complex ? (
              <>
                <PriceChart
                  complex={complex}
                  rentItems={rentItems.filter((i) => i.aptNm?.trim() === complex.name)}
                  selectedArea={selectedArea}
                  onAreaChange={setSelectedArea}
                />
                <TransactionTable
                  complex={complex}
                  rentTransactions={buildRentTransactions(rentItems, complex.name)}
                  selectedArea={selectedArea}
                />
              </>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-muted">
                단지를 선택해주세요
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreBanner />
    </>
  );
}
