"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import useSWR from "swr";
import ComplexList from "@/components/real-estate/ComplexList";
import PriceChart from "@/components/real-estate/PriceChart";
import TransactionTable from "@/components/real-estate/TransactionTable";
import StoreBanner from "@/components/home/StoreBanner";
import { type Complex } from "@/lib/realEstateData";
import { buildComplexList, buildRentTransactions, buildRentOnlyComplexes, buildRentOnlyDynamic, getAreaType } from "@/lib/aptTradeApi";
import type { RawItem, RentRawItem } from "@/lib/molitApi";
import { APT_COMPLEXES, PROPERTY_NAVER_URLS, SILV_TO_APT_API_NAME } from "@/lib/mapData";
import type { AptComplex } from "@/lib/mapData";
import type { AreaTypeMap } from "@/lib/parseAptMapping";

type TradeType = "apt" | "silv" | "offi";
type RegionFilter = AptComplex["region"] | "all";

const REGION_LABELS: Record<RegionFilter, string> = {
  all:      "전체",
  ocean:    "명지오션시티",
  kukje:    "명지국제신도시",
  ecodelta: "에코델타시티",
  sinho:    "신호·화전·지사",
  jisa:     "지사",
  other:    "기타",
};

const REGION_ORDER: RegionFilter[] = ["all", "ocean", "kukje", "ecodelta", "sinho", "other"];

const TAB_LABELS: Record<TradeType, string> = {
  apt: "아파트",
  silv: "분양권",
  offi: "오피스텔",
};

export interface RealEstateData {
  aptComplexes: Complex[];
  silvComplexes: Complex[];
  offiComplexes: Complex[];
  rhComplexes: Complex[];
  rentItems: RentRawItem[];
  offiRentItems: RentRawItem[];
  rhRentItems: RentRawItem[];
}

async function fetchRealEstateData(): Promise<RealEstateData> {
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
    aptRes.json(),
    silvRes.json(),
    offiRes.json(),
    rhRes.json(),
    rentRes.json(),
    offiRentRes.json(),
    rhRentRes.json(),
  ]);

  const aptSilvNormMap = new Map<string, string>();
  for (const apt of APT_COMPLEXES) {
    if (apt.silvApiNames && apt.apiName) {
      for (const nm of apt.silvApiNames) aptSilvNormMap.set(nm, apt.apiName);
    }
  }
  const aptComplexes = (() => {
    const normalizedAptItems = (aptData.items ?? []).map((i: RawItem) => {
      const nm = i.aptNm?.trim();
      if (!nm) return i;
      const canonical = aptSilvNormMap.get(nm);
      return canonical ? { ...i, aptNm: canonical } : i;
    });
    // silv API에만 있는 면적 데이터(분양권 시절 거래)도 apt 단지에 합산
    const silvItemsForApt = (silvData.items ?? [])
      .filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권")
      .flatMap((i: RawItem) => {
        const nm = i.aptNm?.trim();
        if (!nm) return [];
        const aptName = aptSilvNormMap.get(nm);
        return aptName ? [{ ...i, aptNm: aptName }] : [];
      });
    const base = buildComplexList([...normalizedAptItems, ...silvItemsForApt]);
    const rentOnly = buildRentOnlyComplexes(rentData.items ?? [], new Set(base.map((c) => c.name)));
    return [...base, ...rentOnly].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  })();
  const silvNormMap = new Map<string, string>();
  for (const apt of APT_COMPLEXES) {
    if (apt.silvApiNames && apt.silvApiNames.length > 1) {
      const canonical = apt.silvApiNames[0];
      for (const nm of apt.silvApiNames.slice(1)) silvNormMap.set(nm, canonical);
    }
  }
  const silvComplexes = buildComplexList(
    (silvData.items ?? [])
      .filter((i: RawItem) => {
        if ((i.ownershipGbn ?? "").trim() === "입주권") return false;
        // 이미 입주 완료되어 아파트 탭에 합산된 단지는 분양권 탭에서 제외
        const nm = i.aptNm?.trim();
        if (nm && aptSilvNormMap.has(nm)) return false;
        return true;
      })
      .map((i: RawItem) => {
        const nm = i.aptNm?.trim();
        if (!nm) return i;
        const canonical = silvNormMap.get(nm);
        return canonical ? { ...i, aptNm: canonical } : i;
      })
  );
  const offiComplexes = (() => {
    const base = buildComplexList(offiData.items ?? []);
    const rentOnly = buildRentOnlyDynamic(offiRentData.items ?? [], new Set(base.map((c) => c.name)), 8000);
    return [...base, ...rentOnly].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  })();
  const rhComplexes = buildComplexList(rhData.items ?? []).filter((c) =>
    c.name === "부산명지중흥S-클래스더테라스"
  );

  const normalizeRentName = (nm: string) => aptSilvNormMap.get(nm) ?? silvNormMap.get(nm) ?? nm;
  const rentItems = (rentData.items ?? []).map((i: RentRawItem) => {
    const nm = i.aptNm?.trim();
    if (!nm) return i;
    const canonical = normalizeRentName(nm);
    return canonical !== nm ? { ...i, aptNm: canonical } : i;
  });

  return { aptComplexes, silvComplexes, offiComplexes, rhComplexes, rentItems, offiRentItems: offiRentData.items ?? [], rhRentItems: rhRentData.items ?? [] };
}

export default function RealEstateClient({ areaTypeMap, initialData }: { areaTypeMap: AreaTypeMap; initialData?: RealEstateData }) {
  const { data, isLoading } = useSWR<RealEstateData>(
    "real-estate-data",
    fetchRealEstateData,
    {
      fallbackData: initialData,
      revalidateOnMount: !initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  const complexRegionMap = new Map<string, AptComplex["region"]>();
  for (const apt of APT_COMPLEXES) {
    const r = apt.region;
    if (apt.apiName) complexRegionMap.set(apt.apiName, r);
    if (apt.silvApiNames) for (const nm of apt.silvApiNames) complexRegionMap.set(nm, r);
    complexRegionMap.set(apt.name, r);
  }
  complexRegionMap.set("부산명지중흥S-클래스더테라스", "kukje");
  complexRegionMap.set("스위트팰리스", "kukje");

  complexRegionMap.set("명진파크뷰", "jisa");
  complexRegionMap.set("지사과학삼정그린코아", "jisa");

  const allAptComplexes = [
    ...(data?.aptComplexes ?? []),
    ...(data?.rhComplexes ?? []),
  ].sort((a, b) => a.name.localeCompare(b.name, "ko")).map((c, i) => ({ ...c, id: i }));
  const allSilvComplexes = data?.silvComplexes ?? [];
  const offiComplexes = data?.offiComplexes ?? [];
  const rentItems = [...(data?.rentItems ?? []), ...(data?.rhRentItems ?? [])];
  const offiRentItems = data?.offiRentItems ?? [];

  const [activeTab, setActiveTab] = useState<TradeType>("apt");
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("all");
  const filterByRegion = <T extends { name: string }>(list: T[]) => {
    if (activeRegion === "all") return list;
    return list.filter((c) => {
      const r = complexRegionMap.get(c.name) ?? "other";
      return activeRegion === "sinho" ? (r === "sinho" || r === "jisa") : r === activeRegion;
    });
  };

  const aptComplexes = filterByRegion(allAptComplexes);
  const silvComplexes = filterByRegion(allSilvComplexes);

  const [selectedAptId, setSelectedAptId] = useState<number | null>(null);
  const [selectedSilvId, setSelectedSilvId] = useState<number | null>(null);
  const [selectedOffiId, setSelectedOffiId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState("");
  const [showTxSheet, setShowTxSheet] = useState(false);
  const [txTab, setTxTab] = useState<"매매" | "전월세">("매매");
  const [txLimit, setTxLimit] = useState(20);
  const txScrollRef = useRef<HTMLDivElement>(null);
  const txStartYRef = useRef<number | null>(null);
  const txStartXRef = useRef<number | null>(null);
  const savedScrollYRef = useRef(0);
  const areaScrollRef = useRef<HTMLDivElement>(null);
  const mobileHistoryPushedRef = useRef(false);
  const sheetHistoryPushedRef = useRef(false);

  useEffect(() => {
    if (aptComplexes.length > 0) {
      const defaultComplex = aptComplexes.find((c) => c.name === "극동스타클래스") ?? aptComplexes[0];
      setSelectedAptId(defaultComplex.id);
    } else {
      setSelectedAptId(null);
    }
  }, [activeRegion, allAptComplexes.length]);

  useEffect(() => {
    if (silvComplexes.length > 0) setSelectedSilvId(silvComplexes[0].id);
    else setSelectedSilvId(null);
  }, [activeRegion, allSilvComplexes.length]);

  useEffect(() => {
    if (offiComplexes.length > 0 && selectedOffiId === null) setSelectedOffiId(offiComplexes[0].id);
  }, [offiComplexes]);

  const complexesMap: Record<TradeType, Complex[]> = { apt: aptComplexes, silv: silvComplexes, offi: offiComplexes };
  const selectedIdMap: Record<TradeType, number | null> = { apt: selectedAptId, silv: selectedSilvId, offi: selectedOffiId };
  const setSelectedIdMap: Record<TradeType, (id: number) => void> = { apt: setSelectedAptId, silv: setSelectedSilvId, offi: setSelectedOffiId };
  const rentItemsMap: Record<TradeType, RentRawItem[]> = { apt: rentItems, silv: [], offi: offiRentItems };

  const complexes = complexesMap[activeTab];
  const selectedId = selectedIdMap[activeTab];
  const setSelectedId = setSelectedIdMap[activeTab];
  const activeRentItems = rentItemsMap[activeTab];
  const complex = complexes.find((c) => c.id === selectedId) ?? null;
  const complexTypeKey = complex ? (SILV_TO_APT_API_NAME[complex.name] ?? complex.name) : "";
  const naverUrl = complex
    ? (APT_COMPLEXES.find((a) => (a.apiName ?? a.name) === complex.name || a.silvApiNames?.includes(complex.name))?.naverUrl ?? PROPERTY_NAVER_URLS[complex.name] ?? null)
    : null;

  useEffect(() => {
    setSelectedArea("");
  }, [complex?.id]);

  useEffect(() => {
    if (!areaScrollRef.current) return;
    const btn = areaScrollRef.current.querySelector(`[data-area="${selectedArea}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedArea]);

  useEffect(() => {
    const handlePopState = () => {
      if (sheetHistoryPushedRef.current) {
        sheetHistoryPushedRef.current = false;
        setShowTxSheet(false);
      } else {
        mobileHistoryPushedRef.current = false;
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (showTxSheet) {
      savedScrollYRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollYRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, savedScrollYRef.current);
      };
    }
  }, [showTxSheet]);

  const handleMobileSelect = (id: number) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 768 && !mobileHistoryPushedRef.current) {
      mobileHistoryPushedRef.current = true;
      window.history.pushState({ complexSelected: true }, "");
    }
  };

  const handleOpenTxSheet = () => {
    setShowTxSheet(true);
    setTxLimit(20);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      sheetHistoryPushedRef.current = true;
      window.history.pushState({ txSheetOpen: true }, "");
    }
  };

  const closeTxSheet = () => {
    setShowTxSheet(false);
    if (sheetHistoryPushedRef.current) {
      sheetHistoryPushedRef.current = false;
      window.history.back();
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">실거래가 조회</h1>
            <p className="text-gray-600">국토교통부 실거래 데이터 기반 · 최근 5년</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-400 border border-green-400/20 bg-green-400/5 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            국토부 실거래 데이터 · {isLoading ? "로딩 중" : `${complexes.length}개 단지`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-0.5 sm:gap-1 p-1 bg-bg-card border border-border rounded-xl overflow-x-auto">
            {(["apt", "silv", "offi"] as TradeType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-accent text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {REGION_ORDER.filter((r) => {
              if (r === "all") return true;
              if (activeTab === "offi") return false;
              return allAptComplexes.concat(allSilvComplexes as typeof allAptComplexes).some((c) => {
                const cr = complexRegionMap.get(c.name) ?? "other";
                return r === "sinho" ? (cr === "sinho" || cr === "jisa") : cr === r;
              });
            }).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  activeRegion === r
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {REGION_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          <aside className="lg:w-80 flex-shrink-0">
            <ComplexList
              complexes={complexes}
              selectedId={selectedId}
              onSelect={handleMobileSelect}
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
                  rentItems={activeRentItems.filter((i) => i.aptNm?.trim() === complex.name)}
                  selectedArea={selectedArea}
                  onAreaChange={setSelectedArea}
                  naverUrl={naverUrl ?? undefined}
                  areaTypeMap={areaTypeMap}
                  nameForAreaType={complexTypeKey}
                  areaCols={7}
                />
                {/* 모바일 버튼 영역 */}
                <div className="md:hidden flex flex-col gap-2">
                  <button
                    onClick={handleOpenTxSheet}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-base font-semibold border transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                  >
                    매매 · 전월세 거래내역
                  </button>
                  {naverUrl && (
                    <a
                      href={naverUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-base font-semibold rounded-lg transition-colors"
                    >
                      네이버 부동산 보기
                    </a>
                  )}
                </div>
                <div className="hidden md:block">
                  <TransactionTable
                    complex={complex}
                    rentTransactions={buildRentTransactions(activeRentItems, complex.name)}
                    selectedArea={selectedArea}
                    areaTypeMap={areaTypeMap}
                    nameForAreaType={complexTypeKey}
                  />
                </div>
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

      {/* 모바일 거래내역 바텀시트 */}
      {complex && (() => {
        const rentTransactions = buildRentTransactions(activeRentItems, complex.name);
        const tradeRows = selectedArea
          ? complex.transactions.filter((t) => t.area === selectedArea)
          : complex.transactions;
        const rentRows = selectedArea
          ? rentTransactions.filter((t) => t.area === selectedArea)
          : rentTransactions;
        const rows = txTab === "매매" ? tradeRows : rentRows;
        const visibleRows = rows.slice(0, txLimit);
        const allAreas = ["", ...complex.areas];

        function fmt(v: number) {
          if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
          return `${v.toLocaleString()}만`;
        }
        function fmtMan(v: number) { return v.toLocaleString(); }

        return (
          <>
            <div
              className={`md:hidden fixed inset-0 z-[55] bg-black/20 transition-opacity duration-300 ${
                showTxSheet ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={closeTxSheet}
            />
            <div
              className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col ${
                showTxSheet ? "translate-y-0" : "translate-y-full"
              }`}
              style={{ height: "88vh" }}
              onTouchStart={(e) => {
                txStartYRef.current = e.touches[0].clientY;
                txStartXRef.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (txStartYRef.current === null) return;
                const dy = e.changedTouches[0].clientY - txStartYRef.current;
                const dx = e.changedTouches[0].clientX - (txStartXRef.current ?? 0);
                txStartYRef.current = null;
                txStartXRef.current = null;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                  const currentIndex = allAreas.indexOf(selectedArea);
                  if (dx < 0) {
                    const next = Math.min(currentIndex + 1, allAreas.length - 1);
                    setSelectedArea(allAreas[next]);
                  } else {
                    const prev = Math.max(currentIndex - 1, 0);
                    setSelectedArea(allAreas[prev]);
                  }
                  setTxLimit(20);
                } else if (dy > 80 && (txScrollRef.current?.scrollTop ?? 0) === 0) {
                  closeTxSheet();
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
                      onClick={() => { setTxTab(t); setTxLimit(20); }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        txTab === t ? "bg-accent text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={closeTxSheet}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div ref={areaScrollRef} className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto shrink-0">
                <button
                  data-area=""
                  onClick={() => { setSelectedArea(""); setTxLimit(20); }}
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
                    onClick={() => { setSelectedArea(a); setTxLimit(20); }}
                    className={`shrink-0 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedArea === a ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {a}{getAreaType(areaTypeMap, complexTypeKey, a)}㎡
                  </button>
                ))}
              </div>

              <div ref={txScrollRef} className="flex-1 overflow-y-auto overscroll-contain">
                {rows.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-12">거래 내역이 없습니다</div>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
                      총 {rows.length}건
                    </div>
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white border-b border-gray-100">
                        {txTab === "매매" ? (
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-gray-500">거래일</th>
                            <th className="text-right px-2 py-2 font-medium text-gray-500 whitespace-nowrap">동</th>
                            <th className="text-right px-2 py-2 font-medium text-gray-500 whitespace-nowrap">면적</th>
                            <th className="text-right px-2 py-2 font-medium text-gray-500 whitespace-nowrap">층</th>
                            <th className="text-right px-3 py-2 font-medium text-gray-500 whitespace-nowrap">거래가</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-gray-500">거래일</th>
                            <th className="text-right px-2 py-2 font-medium text-gray-500">면적</th>
                            <th className="text-right px-2 py-2 font-medium text-gray-500">층</th>
                            <th className="text-right px-2 py-2 font-medium text-gray-500">유형</th>
                            <th className="text-right px-3 py-2 font-medium text-gray-500">보증/월세</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {txTab === "매매"
                          ? visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-700">{t.date}</td>
                                <td className="px-2 py-2 text-right text-gray-500 whitespace-nowrap">{t.dong ?? "-"}</td>
                                <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">{t.area}{getAreaType(areaTypeMap, complexTypeKey, t.area)}㎡</td>
                                <td className="px-2 py-2 text-right text-gray-500 whitespace-nowrap">{t.floor}</td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmt(t.price)}</td>
                              </tr>
                            ))
                          : visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-700">{t.date}</td>
                                <td className="px-2 py-2 text-right text-gray-600">{t.area}{getAreaType(areaTypeMap, complexTypeKey, t.area)}㎡</td>
                                <td className="px-2 py-2 text-right text-gray-500">{t.floor}</td>
                                <td className="px-2 py-2 text-right">
                                  {t.monthlyRent === 0
                                    ? <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">전세</span>
                                    : <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">월세</span>
                                  }
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                  {t.monthlyRent === 0 ? fmt(t.deposit) : `${fmtMan(t.deposit)} / ${fmtMan(t.monthlyRent)}`}
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
    </>
  );
}
