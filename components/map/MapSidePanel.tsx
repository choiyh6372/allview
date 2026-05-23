"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MapPin } from "lucide-react";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import { buildComplexList, buildRentTransactions } from "@/lib/aptTradeApi";
import type { Complex } from "@/lib/realEstateData";
import type { RentRawItem, RawItem } from "@/lib/molitApi";
import { type AptComplex } from "@/lib/mapData";

interface RealEstateData {
  aptComplexes: Complex[];
  rentItems: RentRawItem[];
}

async function fetchData(): Promise<RealEstateData> {
  const [aptRes, silvRes, rentRes] = await Promise.all([
    fetch("/api/apt-trade?lawdCd=26440&months=60"),
    fetch("/api/silv-trade?lawdCd=26440&months=60"),
    fetch("/api/apt-rent?lawdCd=26440&months=60"),
  ]);
  const [aptData, silvData, rentData] = await Promise.all([
    aptRes.json(), silvRes.json(), rentRes.json(),
  ]);
  const aptComplexes = buildComplexList([
    ...(aptData.items ?? []),
    ...(silvData.items ?? []).filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권"),
  ]);
  return { aptComplexes, rentItems: rentData.items ?? [] };
}

interface Props {
  selectedApt: AptComplex | null;
  onClose: () => void;
}

export default function MapSidePanel({ selectedApt, onClose }: Props) {
  const { data, isLoading } = useSWR<RealEstateData>("real-estate-data", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const [selectedArea, setSelectedArea] = useState("");
  const complex = selectedApt
    ? (data?.aptComplexes.find((c) => c.name === (selectedApt.apiName ?? selectedApt.name)) ?? null)
    : null;

  useEffect(() => {
    setSelectedArea(complex?.areas[0] ?? "");
  }, [complex?.id]);

  const rentItems = data?.rentItems ?? [];

  return (
    <div className="w-[480px] shrink-0 flex flex-col border-r border-border bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* 빈 상태 */}
        {!selectedApt && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
            <MapPin size={40} className="text-border" />
            <p className="text-sm text-gray-400 leading-relaxed">
              지도에서 단지 핀을 클릭하면<br />실거래가 정보를 확인할 수 있습니다
            </p>
          </div>
        )}

        {/* 로딩 */}
        {selectedApt && isLoading && (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            데이터 로딩 중...
          </div>
        )}

        {/* 데이터 없음 */}
        {selectedApt && !isLoading && !complex && (
          <div className="h-full flex flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="text-sm font-semibold text-gray-900">{selectedApt.name}</p>
            <p className="text-xs text-gray-400">실거래가 데이터가 없습니다</p>
          </div>
        )}

        {/* 실거래가 데이터 */}
        {selectedApt && !isLoading && complex && (
          <div className="p-4 space-y-4">
            <PriceChart
              complex={complex}
              rentItems={rentItems.filter((i) => i.aptNm?.trim() === complex.name)}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              light
            />

            <TransactionTable
              complex={complex}
              rentTransactions={buildRentTransactions(rentItems, complex.name)}
              selectedArea={selectedArea}
              light
            />
          </div>
        )}
      </div>

    </div>
  );
}
