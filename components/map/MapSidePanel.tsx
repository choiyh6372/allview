"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { MapPin, Phone, Navigation } from "lucide-react";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import StoreBanner from "@/components/home/StoreBanner";
import { buildComplexList, buildRentTransactions, buildRentOnlyComplexes } from "@/lib/aptTradeApi";
import type { Complex, MonthlyPrice } from "@/lib/realEstateData";
import type { RentRawItem, RawItem } from "@/lib/molitApi";
import { type AptComplex } from "@/lib/mapData";
import type { PromotionStore } from "@/lib/promotionStore";
import { complexData as vrComplexData } from "@/lib/vrData";

interface MapEstateData {
  aptComplexes: Complex[];
  silvComplexes: Complex[];
  rentItems: RentRawItem[];
}

async function fetchData(): Promise<MapEstateData> {
  const [aptRes, silvRes, rentRes] = await Promise.all([
    fetch("/api/apt-trade?lawdCd=26440&months=60"),
    fetch("/api/silv-trade?lawdCd=26440&months=60"),
    fetch("/api/apt-rent?lawdCd=26440&months=60"),
  ]);
  const [aptData, silvData, rentData] = await Promise.all([
    aptRes.json(), silvRes.json(), rentRes.json(),
  ]);
  const base = buildComplexList(aptData.items ?? []);
  const rentOnly = buildRentOnlyComplexes(rentData.items ?? [], new Set(base.map((c) => c.name)));
  const aptComplexes = [...base, ...rentOnly];
  const silvComplexes = buildComplexList(
    (silvData.items ?? []).filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );
  return { aptComplexes, silvComplexes, rentItems: rentData.items ?? [] };
}

function mergePriceArrays(apt: MonthlyPrice[], silv: MonthlyPrice[]): MonthlyPrice[] {
  const map = new Map<string, MonthlyPrice>();
  for (const p of silv) map.set(p.month, p);
  for (const p of apt) map.set(p.month, p);
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function mergeComplexes(apt: Complex, silv: Complex): Complex {
  const transactions = [...apt.transactions, ...silv.transactions]
    .sort((a, b) => b.date.localeCompare(a.date));
  const areas = Array.from(new Set([...apt.areas, ...silv.areas]))
    .sort((a, b) => parseInt(a) - parseInt(b));
  const allAreaKeys = Array.from(new Set([...Object.keys(apt.monthlyPricesByArea), ...Object.keys(silv.monthlyPricesByArea)]));
  const monthlyPricesByArea: Record<string, MonthlyPrice[]> = {};
  for (const area of allAreaKeys) {
    monthlyPricesByArea[area] = mergePriceArrays(apt.monthlyPricesByArea[area] ?? [], silv.monthlyPricesByArea[area] ?? []);
  }
  const monthlyPrices = mergePriceArrays(apt.monthlyPrices, silv.monthlyPrices);
  return { ...apt, transactions, areas, monthlyPrices, monthlyPricesByArea };
}

function AptInfoCard({ apt }: { apt: AptComplex }) {
  if (!apt.hoCnt && !apt.buildYear && !apt.heatType && !apt.address) return null;
  type Single = { kind: "single"; label: string; value: string; href?: string };
  type Pair   = { kind: "pair"; items: { label: string; value: string }[] };
  const rows: (Single | Pair)[] = [
    apt.address      ? { kind: "single", label: "도로명주소", value: apt.address } : null,
    apt.legalAddress ? { kind: "single", label: "법정동주소", value: apt.legalAddress } : null,
    (apt.hoCnt || apt.buildYear) ? {
      kind: "pair",
      items: [
        ...(apt.hoCnt     ? [{ label: "세대수",   value: `${apt.hoCnt.toLocaleString()}세대` }] : []),
        ...(apt.buildYear ? [{ label: "건축연도",  value: `${apt.buildYear}년` }] : []),
      ],
    } : null,
    (apt.dongCnt || apt.heatType) ? {
      kind: "pair",
      items: [
        ...(apt.dongCnt  ? [{ label: "동수",     value: `${apt.dongCnt}개동` }] : []),
        ...(apt.heatType ? [{ label: "난방방식", value: apt.heatType }] : []),
      ],
    } : null,
    apt.evChargerCnt ? { kind: "single", label: "전기차충전기", value: `${apt.evChargerCnt}기` } : null,
    apt.officeTel  ? { kind: "single", label: "관리사무소", value: apt.officeTel, href: `tel:${apt.officeTel}` } : null,
  ].filter(Boolean) as (Single | Pair)[];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{apt.name}</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-blue-500">국토부</span>
          <span className="text-xs text-gray-400">기본정보</span>
        </div>
      </div>
      {rows.map((row, i) =>
        row.kind === "pair" ? (
          <div key={i} className="flex border-b border-gray-100 last:border-b-0">
            {row.items.map(({ label, value }) => (
              <div key={label} className="flex-1 flex items-center justify-between gap-2 px-6 py-3 hover:bg-gray-50 transition-colors first:border-r first:border-gray-100">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <span className="text-gray-500 shrink-0">{row.label}</span>
            {row.href
              ? <a href={row.href} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors text-right">{row.value}</a>
              : <span className="font-semibold text-gray-900 text-right">{row.value}</span>
            }
          </div>
        )
      )}
    </div>
  );
}

interface Props {
  selectedApt: AptComplex | null;
  selectedStore: PromotionStore | null;
  onClose: () => void;
}

export default function MapSidePanel({ selectedApt, selectedStore, onClose }: Props) {
  const { data, isLoading } = useSWR<MapEstateData>("real-estate-data", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const [selectedArea, setSelectedArea] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const aptName = selectedApt ? (selectedApt.apiName ?? selectedApt.name) : null;
  const aptComplex = aptName ? (data?.aptComplexes.find((c) => c.name === aptName) ?? null) : null;

  const silvNames: string[] = selectedApt?.silvApiNames?.length
    ? selectedApt.silvApiNames
    : (aptName ? [aptName] : []);
  const silvComplex = (data?.silvComplexes ?? []).length > 0
    ? silvNames.reduce<Complex | null>((acc, n) => {
        const found = data!.silvComplexes.find((c) => c.name === n) ?? null;
        if (!found) return acc;
        return acc ? mergeComplexes(acc, found) : found;
      }, null)
    : null;

  const complex =
    aptComplex && silvComplex ? mergeComplexes(aptComplex, silvComplex)
    : aptComplex ?? silvComplex ?? null;

  useEffect(() => {
    setSelectedArea(complex?.areas[0] ?? "");
    scrollRef.current?.scrollTo({ top: 0 });
  }, [complex?.id]);

  useEffect(() => {
    if (selectedApt) scrollRef.current?.scrollTo({ top: 0 });
  }, [selectedApt?.id]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [selectedStore?.id]);

  const rentItems = data?.rentItems ?? [];
  const photos = selectedStore?.photos ?? [];

  return (
    <div className="hidden md:flex w-[480px] shrink-0 flex-col bg-white overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-light">

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
              <h2 className="text-xl font-bold text-gray-900">{selectedStore.name}</h2>
            </div>

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
                  네이버 플레이스 보기
                </a>
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
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{selectedApt.name}</p>
              {selectedApt.naverUrl && (
                <a
                  href={selectedApt.naverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  네이버 부동산
                </a>
              )}
            </div>
            <AptInfoCard apt={selectedApt} />
            <p className="text-xs text-gray-400 text-center">실거래가 데이터가 없습니다</p>
          </div>
        )}

        {/* 실거래가 데이터 */}
        {selectedApt && !selectedStore && !isLoading && complex && (
          <div className="p-4 space-y-4">
            <PriceChart
              complex={(() => {
                const vrOverride = vrComplexData.find((c) => c.id === selectedApt.id);
                const overrideVrInfo = vrOverride ? { regionId: vrOverride.regionId, slug: vrOverride.slug, types: vrOverride.types } : complex.vrInfo;
                return { ...complex, name: selectedApt.name, vrInfo: overrideVrInfo };
              })()}
              rentItems={rentItems.filter((i) => i.aptNm?.trim() === complex.name)}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              light
            />
            {selectedApt.naverUrl && (
              <a
                href={selectedApt.naverUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                네이버 부동산 보기
              </a>
            )}
            <AptInfoCard apt={selectedApt} />
            <TransactionTable
              complex={complex}
              rentTransactions={buildRentTransactions(rentItems, complex.name)}
              selectedArea={selectedArea}
              light
            />
          </div>
        )}

        {/* 가게 홍보 슬라이드 */}
        <div className="border-t border-gray-200 bg-white pb-10">
          <StoreBanner compact />
        </div>
      </div>
    </div>
  );
}
