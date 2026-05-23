"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { X, MapPin, Phone, Navigation } from "lucide-react";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
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

export default function MapBottomSheet({ selectedApt, selectedStore, onClose }: Props) {
  const isVisible = !!(selectedApt || selectedStore);

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

  // 드래그로 닫기
  const startYRef = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startYRef.current === null) return;
    const dy = e.changedTouches[0].clientY - startYRef.current;
    if (dy > 80) onClose();
    startYRef.current = null;
  }

  const rentItems = data?.rentItems ?? [];
  const photos = selectedStore?.photos ?? [];

  return (
    <>
      {/* 백드롭 */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div
        ref={sheetRef}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "78vh" }}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X size={16} />
        </button>

        {/* 스크롤 콘텐츠 */}
        <div className="overflow-y-auto scrollbar-light pb-6" style={{ maxHeight: "calc(78vh - 48px)" }}>

          {/* 가게 정보 */}
          {selectedStore && (
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedStore.name}</h2>
              </div>

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
                  <a href={selectedStore.naverUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    네이버 플레이스 보기
                  </a>
                )}
              </div>

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
                      >‹</button>
                      <button
                        onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full text-lg font-bold transition-colors"
                      >›</button>
                      <span className="absolute bottom-2 right-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                        {photoIndex + 1} / {photos.length}
                      </span>
                    </>
                  )}
                </div>
              )}

              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" onClick={() => setPhotoIndex(i)}
                      className={`flex-shrink-0 w-16 h-12 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
                        i === photoIndex ? "border-orange-400" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 아파트 로딩 */}
          {selectedApt && !selectedStore && isLoading && (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              데이터 로딩 중...
            </div>
          )}

          {/* 아파트 데이터 없음 */}
          {selectedApt && !selectedStore && !isLoading && !complex && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 px-8 text-center">
              <MapPin size={32} className="text-gray-300" />
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
        </div>
      </div>
    </>
  );
}
