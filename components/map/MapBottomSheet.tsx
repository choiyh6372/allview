"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { X, MapPin, Phone, Navigation } from "lucide-react";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import { buildComplexList, buildRentTransactions, buildRentOnlyDynamic } from "@/lib/aptTradeApi";
import type { Complex, MonthlyPrice } from "@/lib/realEstateData";
import type { RentRawItem, RawItem } from "@/lib/molitApi";
import { type AptComplex, PROPERTY_NAVER_URLS } from "@/lib/mapData";
import type { PromotionStore } from "@/lib/promotionStore";
import type { SubscriptionItem } from "@/app/api/subscription/route";
import { complexData as vrComplexData } from "@/lib/vrData";
import type { SelectedProperty } from "@/components/map/KakaoMap";
import { type JeongbiProject, JEONGBI_TYPE_COLOR } from "@/lib/jeongbiData";

interface MapEstateData {
  aptComplexes: Complex[];
  silvComplexes: Complex[];
  offiComplexes: Complex[];
  rhComplexes: Complex[];
  rentItems: RentRawItem[];
  offiRentItems: RentRawItem[];
  rhRentItems: RentRawItem[];
}

async function fetchData(): Promise<MapEstateData> {
  const [aptRes, silvRes, offiRes, rhRes, rentRes, offiRentRes, rhRentRes] = await Promise.all([
    fetch("/api/apt-trade?lawdCd=26440&months=60"),
    fetch("/api/silv-trade?lawdCd=26440&months=60"),
    fetch("/api/offi-trade?lawdCd=26440&months=60"),
    fetch("/api/rh-trade?lawdCd=26440&months=60"),
    fetch("/api/apt-rent?lawdCd=26440&months=60"),
    fetch("/api/offi-rent?lawdCd=26440&months=60"),
    fetch("/api/rh-rent?lawdCd=26440&months=60"),
  ]);
  const [aptData, silvData, offiData, rhData, rentData, offiRentData, rhRentData] = await Promise.all([
    aptRes.json(), silvRes.json(), offiRes.json(), rhRes.json(), rentRes.json(), offiRentRes.json(), rhRentRes.json(),
  ]);
  const aptComplexes = buildComplexList(aptData.items ?? []);
  const silvComplexes = buildComplexList(
    (silvData.items ?? []).filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );
  const offiComplexes = (() => {
    const base = buildComplexList(offiData.items ?? []);
    const rentOnly = buildRentOnlyDynamic(offiRentData.items ?? [], new Set(base.map((c) => c.name)), 8000);
    return [...base, ...rentOnly];
  })();
  const rhComplexes = buildComplexList(rhData.items ?? []);
  return { aptComplexes, silvComplexes, offiComplexes, rhComplexes, rentItems: rentData.items ?? [], offiRentItems: offiRentData.items ?? [], rhRentItems: rhRentData.items ?? [] };
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
                <span className="text-gray-600 shrink-0">{label}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <span className="text-gray-600 shrink-0">{row.label}</span>
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

const SUB_STATUS_STYLE = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  closed:   "bg-gray-100 text-gray-600 border-gray-200",
};
const SUB_STATUS_LABEL = { active: "청약중", upcoming: "청약예정", closed: "완료" };

function getSubStatus(item: SubscriptionItem): "active" | "upcoming" | "closed" {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const b = (item.RCEPT_BGNDE ?? "").replace(/-/g, "").slice(0, 8);
  const e = (item.RCEPT_ENDDE ?? "").replace(/-/g, "").slice(0, 8);
  if (!b) return "closed";
  if (today < b) return "upcoming";
  if (!e || today <= e) return "active";
  return "closed";
}

function fmtDate(raw: string) {
  const d = (raw ?? "").replace(/-/g, "").slice(0, 8);
  if (d.length < 8) return "-";
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
}

function fmtMonth(raw: string) {
  const d = (raw ?? "").replace(/-/g, "").slice(0, 6);
  if (d.length < 6) return "-";
  return `${d.slice(0, 4)}년 ${d.slice(4, 6)}월`;
}

const JEONGBI_STATUS_STYLE: Record<JeongbiProject["status"], string> = {
  "추진위":   "bg-yellow-50 text-yellow-700 border-yellow-200",
  "조합설립": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "사업시행": "bg-orange-50 text-orange-700 border-orange-200",
  "관리처분": "bg-orange-50 text-orange-700 border-orange-200",
  "착공":     "bg-blue-50 text-blue-700 border-blue-200",
  "준공":     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "해제":     "bg-gray-100 text-gray-600 border-gray-200",
};

interface Props {
  selectedApt: AptComplex | null;
  selectedStore: PromotionStore | null;
  selectedSubscription: SubscriptionItem | null;
  selectedProperty: SelectedProperty | null;
  selectedJeongbi: JeongbiProject | null;
  onClose: () => void;
}

export default function MapBottomSheet({ selectedApt, selectedStore, selectedSubscription, selectedProperty, selectedJeongbi, onClose }: Props) {
  const isVisible = !!(selectedApt || selectedStore || selectedSubscription || selectedProperty || selectedJeongbi);

  const { data, isLoading } = useSWR<MapEstateData>("map-estate-data", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const [selectedArea, setSelectedArea] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

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

  const aptNaverUrl = selectedApt
    ? (selectedApt.naverUrl ?? PROPERTY_NAVER_URLS[selectedApt.name] ?? null)
    : null;

  const propertyComplex = selectedProperty
    ? (selectedProperty.propertyType === "offi"
        ? (data?.offiComplexes ?? []).find((c) => c.name === selectedProperty.name) ?? null
        : (data?.rhComplexes ?? []).find((c) => c.name === selectedProperty.name) ?? null)
    : null;
  const propertyRentItems = selectedProperty?.propertyType === "offi"
    ? (data?.offiRentItems ?? [])
    : (data?.rhRentItems ?? []);

  useEffect(() => {
    setSelectedArea(complex?.areas[0] ?? "");
    scrollRef.current?.scrollTo({ top: 0 });
  }, [complex?.id]);

  useEffect(() => {
    if (selectedApt) scrollRef.current?.scrollTo({ top: 0 });
  }, [selectedApt?.id]);

  useEffect(() => {
    if (selectedProperty) scrollRef.current?.scrollTo({ top: 0 });
  }, [selectedProperty?.name]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [selectedStore?.id]);

  // 뒤로가기로 닫기 (History API)
  const pushedStateRef = useRef(false);
  const ignoringPopstateRef = useRef(false);

  useEffect(() => {
    if (isVisible) {
      history.pushState({ bottomSheet: true }, "");
      pushedStateRef.current = true;
    } else if (pushedStateRef.current) {
      // X버튼·드래그 등으로 닫힌 경우 → 푸시했던 state 정리
      pushedStateRef.current = false;
      ignoringPopstateRef.current = true;
      history.back();
    }
  }, [isVisible]);

  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      if (ignoringPopstateRef.current) {
        ignoringPopstateRef.current = false;
        return;
      }
      // VR·자식 모달이 닫히며 돌아오는 경우 → 바텀시트 유지
      if (e.state?.bottomSheet === true || e.state?.vrModal === true) return;
      if (pushedStateRef.current) {
        pushedStateRef.current = false;
        onClose();
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [onClose]);

  // 드래그로 닫기
  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function onSheetTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
    startXRef.current = e.touches[0].clientX;
  }
  function onSheetTouchEnd(e: React.TouchEvent) {
    if (startYRef.current === null) return;
    const dy = e.changedTouches[0].clientY - startYRef.current;
    const dx = e.changedTouches[0].clientX - (startXRef.current ?? 0);
    startYRef.current = null;
    startXRef.current = null;
    // 아래로 80px 이상, 수직이 수평보다 크고, 콘텐츠가 최상단일 때만 닫기
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) && (scrollRef.current?.scrollTop ?? 0) === 0) {
      onClose();
    }
  }

  const rentItems = data?.rentItems ?? [];
  const photos = selectedStore?.photos ?? [];

  // 사진 스와이프
  const photoSwipeStartXRef = useRef<number | null>(null);
  function onPhotoTouchStart(e: React.TouchEvent) {
    photoSwipeStartXRef.current = e.touches[0].clientX;
  }
  function onPhotoTouchEnd(e: React.TouchEvent) {
    if (photoSwipeStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - photoSwipeStartXRef.current;
    photoSwipeStartXRef.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setPhotoIndex((i) => (i + 1) % photos.length);
    else setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  }

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
        onTouchStart={onSheetTouchStart}
        onTouchEnd={onSheetTouchEnd}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={16} />
        </button>

        {/* 스크롤 콘텐츠 */}
        <div ref={scrollRef} className="overflow-y-auto scrollbar-light pb-6" style={{ maxHeight: "calc(78vh - 48px)" }}>

          {/* 정비사업 */}
          {selectedJeongbi && !selectedApt && !selectedStore && !selectedSubscription && !selectedProperty && (() => {
            const color = JEONGBI_TYPE_COLOR[selectedJeongbi.type];
            return (
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold border"
                      style={{ background: `${color}18`, color, borderColor: `${color}40` }}
                    >
                      {selectedJeongbi.type}
                    </span>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold border ${JEONGBI_STATUS_STYLE[selectedJeongbi.status]}`}>
                      {selectedJeongbi.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedJeongbi.name}구역</h2>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedJeongbi.gu}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-sm">
                  {[
                    { label: "사업구분", value: selectedJeongbi.type },
                    { label: "추진현황", value: selectedJeongbi.status },
                    { label: "소재지(구)", value: selectedJeongbi.gu },
                    { label: "예정세대수", value: selectedJeongbi.totalHo ? `${selectedJeongbi.totalHo.toLocaleString()}세대` : null },
                  ].filter((r) => r.value).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 shrink-0">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 오피스텔 / 연립다세대 */}
          {selectedProperty && !selectedApt && !selectedStore && !selectedSubscription && (
            <div className="p-4 space-y-4">
              {isLoading ? (
                <div className="text-sm text-gray-400 text-center py-8">데이터 로딩 중...</div>
              ) : propertyComplex ? (
                <>
                  <PriceChart
                    complex={propertyComplex}
                    rentItems={propertyRentItems.filter((i) => i.aptNm?.trim() === propertyComplex.name)}
                    selectedArea={selectedArea}
                    onAreaChange={setSelectedArea}
                    light
                  />
                  {PROPERTY_NAVER_URLS[selectedProperty.name] && (
                    <a
                      href={PROPERTY_NAVER_URLS[selectedProperty.name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      네이버 부동산 보기
                    </a>
                  )}
                  <TransactionTable
                    complex={propertyComplex}
                    rentTransactions={buildRentTransactions(propertyRentItems, propertyComplex.name)}
                    selectedArea={selectedArea}
                    light
                  />
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">실거래가 데이터가 없습니다</p>
              )}
            </div>
          )}

          {/* 분양정보 */}
          {selectedSubscription && !selectedApt && !selectedStore && (() => {
            const st = getSubStatus(selectedSubscription);
            return (
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold border ${SUB_STATUS_STYLE[st]}`}>
                      {SUB_STATUS_LABEL[st]}
                    </span>
                    {selectedSubscription.kind === "munorwi" && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                        무순위
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedSubscription.HOUSE_NM}</h2>
                  {selectedSubscription.HSSPLY_ADRES && (
                    <p className="text-xs text-gray-600 mt-0.5">{selectedSubscription.HSSPLY_ADRES}</p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-sm">
                  {[
                    { label: "건설사", value: selectedSubscription.CNSTRCT_ENTRPS_NM },
                    { label: "주택유형", value: selectedSubscription.HOUSE_DTL_SECD_NM || selectedSubscription.HOUSE_SECD_NM },
                    { label: "총공급세대", value: selectedSubscription.TOT_SUPLY_HSHLDCO ? `${Number(selectedSubscription.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : null },
                    { label: "청약 시작", value: fmtDate(selectedSubscription.RCEPT_BGNDE) },
                    { label: "청약 마감", value: fmtDate(selectedSubscription.RCEPT_ENDDE) },
                    { label: "당첨자 발표", value: fmtDate(selectedSubscription.PRZWNER_PRESNATN_DE) },
                    { label: "입주 예정", value: fmtMonth(selectedSubscription.MVNIN_PREARNGE_YM) },
                  ].filter((r) => r.value && r.value !== "-").map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 shrink-0">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {selectedSubscription.PBLANC_URL && (
                  <a
                    href={selectedSubscription.PBLANC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    청약홈에서 자세히 보기
                  </a>
                )}
              </div>
            );
          })()}

          {/* 가게 정보 */}
          {selectedStore && (
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedStore.name}</h2>
              </div>

              <div className="space-y-2 text-sm">
                {selectedStore.address && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <Navigation size={14} className="mt-0.5 shrink-0 text-gray-400" />
                    <span>{selectedStore.address}</span>
                  </div>
                )}
                {selectedStore.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
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
                <div
                  className="relative rounded-xl overflow-hidden bg-gray-100"
                  onTouchStart={onPhotoTouchStart}
                  onTouchEnd={onPhotoTouchEnd}
                >
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
            <div className="p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">{selectedApt.name}</p>
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
              {aptNaverUrl && (
                <a
                  href={aptNaverUrl}
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
        </div>
      </div>
    </>
  );
}
