"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import ComplexList from "@/components/real-estate/ComplexList";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import StoreBanner from "@/components/home/StoreBanner";
import { type Complex } from "@/lib/realEstateData";
import { buildComplexList, buildRentTransactions } from "@/lib/aptTradeApi";
import type { RawItem, RentRawItem } from "@/lib/molitApi";

type TradeType = "apt" | "silv";

const TAB_LABELS: Record<TradeType, string> = {
  apt: "아파트",
  silv: "분양권",
};

interface RealEstateData {
  aptComplexes: Complex[];
  silvComplexes: Complex[];
  rentItems: RentRawItem[];
}

async function fetchRealEstateData(): Promise<RealEstateData> {
  const [aptRes, silvRes, rentRes] = await Promise.all([
    fetch("/api/apt-trade?lawdCd=26440&months=60"),
    fetch("/api/silv-trade?lawdCd=26440&months=60"),
    fetch("/api/apt-rent?lawdCd=26440&months=60"),
  ]);

  const [aptData, silvData, rentData] = await Promise.all([
    aptRes.json(),
    silvRes.json(),
    rentRes.json(),
  ]);

  const aptComplexes = buildComplexList(aptData.items ?? []);
  const silvComplexes = buildComplexList(
    (silvData.items ?? []).filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );

  return { aptComplexes, silvComplexes, rentItems: rentData.items ?? [] };
}

export default function RealEstateClient() {
  const { data, isLoading } = useSWR<RealEstateData>(
    "real-estate-data",
    fetchRealEstateData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  const aptComplexes = data?.aptComplexes ?? [];
  const silvComplexes = data?.silvComplexes ?? [];
  const rentItems = data?.rentItems ?? [];

  const [activeTab, setActiveTab] = useState<TradeType>("apt");
  const [selectedAptId, setSelectedAptId] = useState<number | null>(null);
  const [selectedSilvId, setSelectedSilvId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    if (aptComplexes.length > 0 && selectedAptId === null) {
      const defaultComplex = aptComplexes.find((c) => c.name === "극동스타클래스") ?? aptComplexes[0];
      setSelectedAptId(defaultComplex.id);
    }
  }, [aptComplexes]);

  useEffect(() => {
    if (silvComplexes.length > 0 && selectedSilvId === null) {
      setSelectedSilvId(silvComplexes[0].id);
    }
  }, [silvComplexes]);

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
            국토부 실거래 데이터 · {isLoading ? "로딩 중" : `${complexes.length}개 단지`}
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
              isLoading={isLoading}
            />
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            {isLoading ? (
              <div className="h-60 flex items-center justify-center text-sm text-muted">
                데이터를 불러오는 중...
              </div>
            ) : complex ? (
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
