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
import { APT_COMPLEXES, PROPERTY_NAVER_URLS } from "@/lib/mapData";
import type { AreaTypeMap } from "@/lib/parseAptMapping";

type TradeType = "apt" | "silv" | "offi";

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

  const aptComplexes = (() => {
    const base = buildComplexList(aptData.items ?? []);
    const rentOnly = buildRentOnlyComplexes(rentData.items ?? [], new Set(base.map((c) => c.name)));
    return [...base, ...rentOnly].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  })();
  const silvComplexes = buildComplexList(
    (silvData.items ?? []).filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );
  const offiComplexes = (() => {
    const base = buildComplexList(offiData.items ?? []);
    const rentOnly = buildRentOnlyDynamic(offiRentData.items ?? [], new Set(base.map((c) => c.name)), 8000);
    return [...base, ...rentOnly].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  })();
  const rhComplexes = buildComplexList(rhData.items ?? []).filter((c) =>
    c.name === "부산명지중흥S-클래스더테라스"
  );

  return { aptComplexes, silvComplexes, offiComplexes, rhComplexes, rentItems: rentData.items ?? [], offiRentItems: offiRentData.items ?? [], rhRentItems: rhRentData.items ?? [] };
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

  const aptComplexes = [
    ...(data?.aptComplexes ?? []),
    ...(data?.rhComplexes ?? []),
  ].sort((a, b) => a.name.localeCompare(b.name, "ko")).map((c, i) => ({ ...c, id: i }));
  const silvComplexes = data?.silvComplexes ?? [];
  const offiComplexes = data?.offiComplexes ?? [];
  const rentItems = [...(data?.rentItems ?? []), ...(data?.rhRentItems ?? [])];
  const offiRentItems = data?.offiRentItems ?? [];

  const [activeTab, setActiveTab] = useState<TradeType>("apt");
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
  const areaScrollRef = useRef<HTMLDivElement>(null);
  const mobileHistoryPushedRef = useRef(false);
  const sheetHistoryPushedRef = useRef(false);

  useEffect(() => {
    if (aptComplexes.length > 0 && selectedAptId === null) {
      const defaultComplex = aptComplexes.find((c) => c.name === "극동스타클래스") ?? aptComplexes[0];
      setSelectedAptId(defaultComplex.id);
    }
  }, [aptComplexes]);

  useEffect(() => {
    if (silvComplexes.length > 0 && selectedSilvId === null) setSelectedSilvId(silvComplexes[0].id);
  }, [silvComplexes]);

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
  const naverUrl = complex
    ? (APT_COMPLEXES.find((a) => (a.apiName ?? a.name) === complex.name || a.silvApiNames?.includes(complex.name))?.naverUrl ?? PROPERTY_NAVER_URLS[complex.name] ?? null)
    : null;

  useEffect(() => {
    setSelectedArea(complex?.areas[0] ?? "");
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

        <div className="flex gap-0.5 sm:gap-1 p-1 mb-6 bg-bg-card border border-border rounded-xl overflow-x-auto w-full sm:w-fit">
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
                    {a}{getAreaType(areaTypeMap, complex.name, a)}㎡
                  </button>
                ))}
              </div>

              <div ref={txScrollRef} className="flex-1 overflow-y-auto">
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
                                <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
                                <td className="px-2 py-2 text-right text-gray-500 whitespace-nowrap">{t.floor}</td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmt(t.price)}</td>
                              </tr>
                            ))
                          : visibleRows.map((t: any, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-700">{t.date}</td>
                                <td className="px-2 py-2 text-right text-gray-600">{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
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
