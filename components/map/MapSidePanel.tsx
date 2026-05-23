"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MapPin, Phone, Navigation } from "lucide-react";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import StoreBanner from "@/components/home/StoreBanner";
import { buildComplexList, buildRentTransactions } from "@/lib/aptTradeApi";
import type { Complex } from "@/lib/realEstateData";
import type { RentRawItem, RawItem } from "@/lib/molitApi";
import { type AptComplex } from "@/lib/mapData";
import type { PromotionStore } from "@/lib/promotionStore";

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
  selectedStore: PromotionStore | null;
  onClose: () => void;
}

export default function MapSidePanel({ selectedApt, selectedStore, onClose }: Props) {
  const { data, isLoading } = useSWR<RealEstateData>("real-estate-data", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const [selectedArea, setSelectedArea] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

  const complex = selectedApt
    ? (data?.aptComplexes.find((c) => c.name === (selectedApt.apiName ?? selectedApt.name)) ?? null)
    : null;

  useEffect(() => {
    setSelectedArea(complex?.areas[0] ?? "");
  }, [complex?.id]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [selectedStore?.id]);

  const rentItems = data?.rentItems ?? [];
  const photos = selectedStore?.photos ?? [];

  return (
    <div className="w-[480px] shrink-0 flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-light">

        {/* 빈 상태 */}
        {!selectedApt && !selectedStore && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
            <MapPin size={40} className="text-border" />
            <p className="text-sm text-gray-400 leading-relaxed">
              지도에서 단지 핀을 클릭하면<br />실거래가 정보를 확인할 수 있습니다
            </p>
          </div>
        )}

        {/* 가게 정보 */}
        {selectedStore && (
          <div className="p-4 space-y-4">
            {/* 헤더 */}
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block bg-orange-100 text-orange-500">
                {selectedStore.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900">{selectedStore.name}</h2>
              {selectedStore.region && (
                <p className="text-xs text-gray-400 mt-0.5">{selectedStore.region}</p>
              )}
            </div>

            {/* 사진 캐러셀 */}
            {photos.length > 0 && (
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[photoIndex]}
                  alt={selectedStore.name}
                  className="w-full aspect-[4/3] object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full text-lg font-bold transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full text-lg font-bold transition-colors"
                    >
                      ›
                    </button>
                    <span className="absolute bottom-2 right-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                      {photoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* 썸네일 */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    onClick={() => setPhotoIndex(i)}
                    className={`flex-shrink-0 w-16 h-12 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
                      i === photoIndex ? "border-orange-400" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 상세 정보 */}
            <div className="space-y-2 text-sm">
              {selectedStore.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Navigation size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <span>{selectedStore.address}</span>
                </div>
              )}
              {selectedStore.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="shrink-0 text-gray-400" />
                  <a href={`tel:${selectedStore.phone}`} className="hover:text-orange-500 transition-colors">
                    {selectedStore.phone}
                  </a>
                </div>
              )}
              {selectedStore.naverUrl && (
                <a
                  href={selectedStore.naverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  네이버 지도에서 보기
                </a>
              )}
            </div>
          </div>
        )}

        {/* 아파트 로딩 */}
        {selectedApt && !selectedStore && isLoading && (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            데이터 로딩 중...
          </div>
        )}

        {/* 아파트 데이터 없음 */}
        {selectedApt && !selectedStore && !isLoading && !complex && (
          <div className="h-full flex flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="text-sm font-semibold text-gray-900">{selectedApt.name}</p>
            <p className="text-xs text-gray-400">실거래가 데이터가 없습니다</p>
          </div>
        )}

        {/* 실거래가 데이터 */}
        {selectedApt && !selectedStore && !isLoading && complex && (
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

        {/* 가게 홍보 슬라이드 */}
        <div className="border-t border-gray-200 bg-white">
          <StoreBanner compact />
        </div>
      </div>
    </div>
  );
}
