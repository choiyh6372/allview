"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { X, MapPin, Phone, Navigation, Eye } from "lucide-react";
import PriceChart from "@/components/real-estate/PriceChart";
import VRModal from "@/components/vr-tour/VRModal";
import { buildComplexList, buildRentTransactions, buildRentOnlyDynamic, getAreaType } from "@/lib/aptTradeApi";
import type { Complex, MonthlyPrice } from "@/lib/realEstateData";
import type { RentRawItem, RawItem } from "@/lib/molitApi";
import { type AptComplex, PROPERTY_NAVER_URLS } from "@/lib/mapData";
import type { PromotionStore } from "@/lib/promotionStore";
import type { SubscriptionItem } from "@/app/api/subscription/route";
import { complexData as vrComplexData } from "@/lib/vrData";
import type { SelectedProperty } from "@/components/map/KakaoMap";
import { type JeongbiProject, JEONGBI_TYPE_COLOR } from "@/lib/jeongbiData";
import type { AreaTypeMap } from "@/lib/parseAptMapping";

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
    apt.parkingCnt ? { kind: "single", label: "주차대수", value: `${apt.parkingCnt.toLocaleString()}대${apt.hoCnt ? ` (세대당 ${(apt.parkingCnt / apt.hoCnt).toFixed(1)}대)` : ""}` } : null,
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
  areaTypeMap?: AreaTypeMap;
}

export default function MapBottomSheet({ selectedApt, selectedStore, selectedSubscription, selectedProperty, selectedJeongbi, onClose, areaTypeMap = {} }: Props) {
  const isVisible = !!(selectedApt || selectedStore || selectedSubscription || selectedProperty || selectedJeongbi);

  const { data, isLoading } = useSWR<MapEstateData>("map-estate-data", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const [selectedArea, setSelectedArea] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showVrNoData, setShowVrNoData] = useState(false);
  const [showTxTable, setShowTxTable] = useState(false);
  const [txTab, setTxTab] = useState<"매매" | "전월세">("매매");
  const [txLimit, setTxLimit] = useState(20);
  const [showPropertyTxSheet, setShowPropertyTxSheet] = useState(false);
  const [propertyTxTab, setPropertyTxTab] = useState<"매매" | "전월세">("매매");
  const [propertyTxLimit, setPropertyTxLimit] = useState(20);

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("apt-favorites");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem("apt-favorites", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

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
    setSelectedArea("");
    setShowTxTable(false);
    txSheetHistoryPushedRef.current = false;
    setTxTab("매매");
    setTxLimit(20);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [complex?.id]);

  useEffect(() => {
    if (selectedApt) scrollRef.current?.scrollTo({ top: 0 });
  }, [selectedApt?.id]);

  useEffect(() => {
    if (selectedProperty) {
      setShowPropertyTxSheet(false);
      propertyTxSheetHistoryPushedRef.current = false;
      setPropertyTxTab("매매");
      setPropertyTxLimit(20);
      scrollRef.current?.scrollTo({ top: 0 });
    }
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
      // bottomSheet 상태로 돌아옴 = 거래내역 서브시트가 뒤로가기로 닫힌 경우
      if (e.state?.bottomSheet === true) {
        if (txSheetHistoryPushedRef.current) {
          txSheetHistoryPushedRef.current = false;
          setShowTxTable(false);
        }
        if (propertyTxSheetHistoryPushedRef.current) {
          propertyTxSheetHistoryPushedRef.current = false;
          setShowPropertyTxSheet(false);
        }
        return;
      }
      // VR 모달이 닫히며 돌아오는 경우 → 바텀시트 유지
      if (e.state?.vrModal === true) return;
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
  const txStartYRef = useRef<number | null>(null);
  const txStartXRef = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const txScrollRef = useRef<HTMLDivElement>(null);
  const propertyTxScrollRef = useRef<HTMLDivElement>(null);
  const propertyTxStartYRef = useRef<number | null>(null);
  const propertyTxStartXRef = useRef<number | null>(null);
  const txSheetHistoryPushedRef = useRef(false);
  const propertyTxSheetHistoryPushedRef = useRef(false);
  const txAreaScrollRef = useRef<HTMLDivElement>(null);
  const propertyTxAreaScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = showTxTable ? txAreaScrollRef : showPropertyTxSheet ? propertyTxAreaScrollRef : null;
    if (!ref?.current) return;
    const btn = ref.current.querySelector(`[data-area="${selectedArea}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedArea, showTxTable, showPropertyTxSheet]);

  function openTxSheet() {
    setShowTxTable(true);
    txSheetHistoryPushedRef.current = true;
    history.pushState({ txSheet: true }, "");
  }
  function closeTxSheet() {
    setShowTxTable(false);
    if (txSheetHistoryPushedRef.current) {
      txSheetHistoryPushedRef.current = false;
      history.back();
    }
  }
  function openPropertyTxSheet() {
    setShowPropertyTxSheet(true);
    propertyTxSheetHistoryPushedRef.current = true;
    history.pushState({ propertyTxSheet: true }, "");
  }
  function closePropertyTxSheet() {
    setShowPropertyTxSheet(false);
    if (propertyTxSheetHistoryPushedRef.current) {
      propertyTxSheetHistoryPushedRef.current = false;
      history.back();
    }
  }

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
        style={{ height: "88vh" }}
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
        <div ref={scrollRef} className="overflow-y-auto scrollbar-light pb-6" style={{ maxHeight: "calc(88vh - 48px)" }}>

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
                    areaTypeMap={areaTypeMap}
                    light
                  />
                  <button
                    onClick={() => showPropertyTxSheet ? closePropertyTxSheet() : openPropertyTxSheet()}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-base font-semibold border transition-colors ${
                      showPropertyTxSheet
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                    }`}
                  >
                    {showPropertyTxSheet ? "거래내역 닫기" : "매매 · 전월세 거래내역"}
                  </button>
                  {PROPERTY_NAVER_URLS[selectedProperty.name] && (
                    <a
                      href={PROPERTY_NAVER_URLS[selectedProperty.name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-base font-semibold rounded-lg border border-transparent transition-colors"
                    >
                      네이버 부동산 보기
                    </a>
                  )}
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
          {selectedApt && !selectedStore && !isLoading && !complex && (() => {
            const vrEntry = vrComplexData.find((c) => c.id === selectedApt.id);
            return (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedApt.name}</p>
                    <button
                      onClick={(e) => toggleFavorite(selectedApt.id, e)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-sm font-bold transition-colors border ${
                        favorites.has(selectedApt.id)
                          ? "bg-yellow-400 text-white border-yellow-400"
                          : "bg-gray-100 text-gray-400 border-gray-200 hover:text-yellow-500"
                      }`}
                    >
                      ★
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {vrEntry && (
                      <button
                        onClick={() => setShowVrNoData(true)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white hover:bg-accent/80 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Eye size={13} />
                        VR 보기
                      </button>
                    )}
                    {aptNaverUrl && (
                      <a
                        href={aptNaverUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        네이버 부동산
                      </a>
                    )}
                  </div>
                </div>
                <AptInfoCard apt={selectedApt} />
                <p className="text-xs text-gray-400 text-center">실거래가 데이터가 없습니다</p>
                {showVrNoData && vrEntry && (
                  <VRModal complex={vrEntry} onClose={() => setShowVrNoData(false)} />
                )}
              </div>
            );
          })()}

          {/* 실거래가 데이터 */}
          {selectedApt && !selectedStore && !isLoading && complex && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 pr-10">
                <p className="text-sm font-semibold text-gray-900">{selectedApt.name}</p>
                <button
                  onClick={(e) => toggleFavorite(selectedApt.id, e)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-sm font-bold transition-colors border ${
                    favorites.has(selectedApt.id)
                      ? "bg-yellow-400 text-white border-yellow-400"
                      : "bg-gray-100 text-gray-400 border-gray-200 hover:text-yellow-500"
                  }`}
                >
                  ★
                </button>
              </div>
              <PriceChart
                complex={(() => {
                  const vrOverride = vrComplexData.find((c) => c.id === selectedApt.id);
                  const overrideVrInfo = vrOverride ? { regionId: vrOverride.regionId, slug: vrOverride.slug, types: vrOverride.types } : complex.vrInfo;
                  return { ...complex, name: selectedApt.name, vrInfo: overrideVrInfo };
                })()}
                rentItems={rentItems.filter((i) => i.aptNm?.trim() === complex.name)}
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
                areaTypeMap={areaTypeMap}
                nameForAreaType={selectedApt.apiName ?? selectedApt.name}
                light
              />
              <button
                onClick={() => showTxTable ? closeTxSheet() : openTxSheet()}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-base font-semibold border transition-colors ${
                  showTxTable
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                }`}
              >
                {showTxTable ? "거래내역 닫기" : "매매 · 전월세 거래내역"}
              </button>
              {aptNaverUrl && (
                <a
                  href={aptNaverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-base font-semibold rounded-lg border border-transparent transition-colors"
                >
                  네이버 부동산 보기
                </a>
              )}
              <AptInfoCard apt={selectedApt} />
            </div>
          )}
        </div>
      </div>

      {/* 거래내역 바텀시트 */}
      {(() => {
        if (!complex) return null;
        const rentTransactions = buildRentTransactions(rentItems, complex.name);
        const tradeRows = selectedArea
          ? complex.transactions.filter((t) => t.area === selectedArea)
          : complex.transactions;
        const rentRows = selectedArea
          ? rentTransactions.filter((t) => t.area === selectedArea)
          : rentTransactions;
        const rows = txTab === "매매" ? tradeRows : rentRows;
        const visibleRows = rows.slice(0, txLimit);

        function fmt(v: number) {
          if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
          return `${v.toLocaleString()}만`;
        }
        function fmtMan(v: number) { return v.toLocaleString(); }

        return (
          <>
            {/* 거래내역 백드롭 */}
            <div
              className={`md:hidden fixed inset-0 z-[55] bg-black/20 transition-opacity duration-300 ${
                showTxTable ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => closeTxSheet()}
            />
            {/* 거래내역 시트 */}
            <div
              className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col ${
                showTxTable ? "translate-y-0" : "translate-y-full"
              }`}
              style={{ height: "88vh" }}
              onTouchStart={(e) => { txStartYRef.current = e.touches[0].clientY; txStartXRef.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (txStartYRef.current === null) return;
                const dy = e.changedTouches[0].clientY - txStartYRef.current;
                const dx = e.changedTouches[0].clientX - (txStartXRef.current ?? 0);
                txStartYRef.current = null;
                txStartXRef.current = null;
                const allAreas = ["", ...complex.areas];
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                  const currentIndex = allAreas.indexOf(selectedArea);
                  if (dx < 0) setSelectedArea(allAreas[Math.min(currentIndex + 1, allAreas.length - 1)]);
                  else setSelectedArea(allAreas[Math.max(currentIndex - 1, 0)]);
                  setTxLimit(20);
                } else if (dy > 80 && (txScrollRef.current?.scrollTop ?? 0) === 0) {
                  closeTxSheet();
                }
              }}
            >
              {/* 드래그 핸들 */}
              <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* 헤더 - 탭 + 닫기 */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 shrink-0">
                <div className="flex gap-1">
                  {(["매매", "전월세"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTxTab(t); setTxLimit(20); }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        txTab === t
                          ? "bg-accent text-white"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => closeTxSheet()}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 면적 필터 */}
              <div ref={txAreaScrollRef} className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto shrink-0">
                <button
                  data-area=""
                  onClick={(e) => { setSelectedArea(""); (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
                  className={`shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    !selectedArea ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                {complex.areas.map((a) => (
                  <button
                    key={a}
                    data-area={a}
                    onClick={(e) => { setSelectedArea(a); (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
                    className={`shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedArea === a ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {a}{getAreaType(areaTypeMap, complex.name, a)}㎡
                  </button>
                ))}
              </div>

              {/* 거래 목록 */}
              <div ref={txScrollRef} className="flex-1 overflow-y-auto">
                {rows.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-12">거래 내역이 없습니다</div>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
                      총 {rows.length}건
                    </div>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white border-b border-gray-100">
                        {txTab === "매매" ? (
                          <tr>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">거래일</th>
                            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">동</th>
                            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">면적</th>
                            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">층</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">거래가</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">거래일</th>
                            <th className="text-right px-2 py-2.5 text-xs font-medium text-gray-500">면적</th>
                            <th className="text-right px-2 py-2.5 text-xs font-medium text-gray-500">층</th>
                            <th className="text-right px-2 py-2.5 text-xs font-medium text-gray-500">유형</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">보증/월세</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {txTab === "매매"
                          ? visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700">{t.date}</td>
                                <td className="px-3 py-2.5 text-right text-gray-500">{t.dong ?? "-"}</td>
                                <td className="px-3 py-2.5 text-right text-gray-600">{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
                                <td className="px-3 py-2.5 text-right text-gray-500">{t.floor}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{fmt(t.price)}</td>
                              </tr>
                            ))
                          : visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{t.date}</td>
                                <td className="px-2 py-2.5 text-right text-gray-600 whitespace-nowrap">{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
                                <td className="px-2 py-2.5 text-right text-gray-500 whitespace-nowrap">{t.floor}</td>
                                <td className="px-2 py-2.5 text-right whitespace-nowrap">
                                  {t.monthlyRent === 0
                                    ? <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">전세</span>
                                    : <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">월세</span>
                                  }
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                                  {t.monthlyRent === 0
                                    ? fmt(t.deposit)
                                    : `${fmtMan(t.deposit)} / ${fmtMan(t.monthlyRent)}`}
                                </td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                    {txLimit < rows.length && (
                      <button
                        onClick={() => setTxLimit((v) => v + 20)}
                        className="w-full py-3 text-xs font-medium text-gray-500 hover:text-gray-800 border-t border-gray-100 transition-colors"
                      >
                        더보기 ({Math.min(20, rows.length - txLimit)}건 더)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        );
      })()}
      {/* 오피스텔/연립 거래내역 바텀시트 */}
      {(() => {
        if (!propertyComplex) return null;
        const rentTransactions = buildRentTransactions(propertyRentItems, propertyComplex.name);
        const tradeRows = selectedArea
          ? propertyComplex.transactions.filter((t) => t.area === selectedArea)
          : propertyComplex.transactions;
        const rentRows = selectedArea
          ? rentTransactions.filter((t) => t.area === selectedArea)
          : rentTransactions;
        const rows = propertyTxTab === "매매" ? tradeRows : rentRows;
        const visibleRows = rows.slice(0, propertyTxLimit);

        function fmt(v: number) {
          if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
          return `${v.toLocaleString()}만`;
        }
        function fmtMan(v: number) { return v.toLocaleString(); }

        return (
          <>
            <div
              className={`md:hidden fixed inset-0 z-[55] bg-black/20 transition-opacity duration-300 ${
                showPropertyTxSheet ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => closePropertyTxSheet()}
            />
            <div
              className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col ${
                showPropertyTxSheet ? "translate-y-0" : "translate-y-full"
              }`}
              style={{ height: "88vh" }}
              onTouchStart={(e) => { propertyTxStartYRef.current = e.touches[0].clientY; propertyTxStartXRef.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (propertyTxStartYRef.current === null) return;
                const dy = e.changedTouches[0].clientY - propertyTxStartYRef.current;
                const dx = e.changedTouches[0].clientX - (propertyTxStartXRef.current ?? 0);
                propertyTxStartYRef.current = null;
                propertyTxStartXRef.current = null;
                const allAreas = ["", ...propertyComplex.areas];
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                  const currentIndex = allAreas.indexOf(selectedArea);
                  if (dx < 0) setSelectedArea(allAreas[Math.min(currentIndex + 1, allAreas.length - 1)]);
                  else setSelectedArea(allAreas[Math.max(currentIndex - 1, 0)]);
                  setPropertyTxLimit(20);
                } else if (dy > 80 && (propertyTxScrollRef.current?.scrollTop ?? 0) === 0) {
                  closePropertyTxSheet();
                }
              }}
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 shrink-0">
                <div className="flex gap-1">
                  {(["매매", "전월세"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setPropertyTxTab(t); setPropertyTxLimit(20); }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        propertyTxTab === t
                          ? "bg-accent text-white"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => closePropertyTxSheet()}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div ref={propertyTxAreaScrollRef} className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto shrink-0">
                <button
                  data-area=""
                  onClick={(e) => { setSelectedArea(""); setPropertyTxLimit(20); (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
                  className={`shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    !selectedArea ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                {propertyComplex.areas.map((a) => (
                  <button
                    key={a}
                    data-area={a}
                    onClick={(e) => { setSelectedArea(a); setPropertyTxLimit(20); (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
                    className={`shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedArea === a ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {a}{getAreaType(areaTypeMap, propertyComplex.name, a)}㎡
                  </button>
                ))}
              </div>

              <div ref={propertyTxScrollRef} className="flex-1 overflow-y-auto">
                {rows.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-12">거래 내역이 없습니다</div>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
                      총 {rows.length}건
                    </div>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white border-b border-gray-100">
                        {propertyTxTab === "매매" ? (
                          <tr>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">거래일</th>
                            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">면적</th>
                            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">층</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">거래가</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">거래일</th>
                            <th className="text-right px-2 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">면적</th>
                            <th className="text-right px-2 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">층</th>
                            <th className="text-right px-2 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">유형</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">보증/월세</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {propertyTxTab === "매매"
                          ? visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{t.date}</td>
                                <td className="px-3 py-2.5 text-right text-gray-600 whitespace-nowrap">{t.area}{getAreaType(areaTypeMap, propertyComplex.name, t.area)}㎡</td>
                                <td className="px-3 py-2.5 text-right text-gray-500 whitespace-nowrap">{t.floor}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">{fmt(t.price)}</td>
                              </tr>
                            ))
                          : visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{t.date}</td>
                                <td className="px-2 py-2.5 text-right text-gray-600 whitespace-nowrap">{t.area}{getAreaType(areaTypeMap, propertyComplex.name, t.area)}㎡</td>
                                <td className="px-2 py-2.5 text-right text-gray-500 whitespace-nowrap">{t.floor}</td>
                                <td className="px-2 py-2.5 text-right whitespace-nowrap">
                                  {t.monthlyRent === 0
                                    ? <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">전세</span>
                                    : <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">월세</span>
                                  }
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                                  {t.monthlyRent === 0 ? fmt(t.deposit) : `${fmtMan(t.deposit)} / ${fmtMan(t.monthlyRent)}`}
                                </td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                    {propertyTxLimit < rows.length && (
                      <button
                        onClick={() => setPropertyTxLimit((v) => v + 20)}
                        className="w-full py-3 text-xs font-medium text-gray-500 hover:text-gray-800 border-t border-gray-100 transition-colors"
                      >
                        더보기 ({Math.min(20, rows.length - propertyTxLimit)}건 더)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
