"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { X } from "lucide-react";
import { buildComplexList, buildRentTransactions, buildRentOnlyComplexes, buildRentOnlyDynamic, getAreaType } from "@/lib/aptTradeApi";
import type { AptComplex } from "@/lib/mapData";
import type { Complex } from "@/lib/realEstateData";
import type { RentRawItem, RawItem } from "@/lib/molitApi";
import type { SelectedProperty } from "@/components/map/KakaoMap";

function mergeComplexes(apt: Complex, silv: Complex): Complex {
  const transactions = [...apt.transactions, ...silv.transactions].sort((a, b) => b.date.localeCompare(a.date));
  const areas = Array.from(new Set([...apt.areas, ...silv.areas])).sort((a, b) => parseInt(a) - parseInt(b));
  return { ...apt, transactions, areas };
}

async function fetchData() {
  const [aptRes, silvRes, rentRes, offiRes, rhRes, offiRentRes, rhRentRes] = await Promise.all([
    fetch("/api/apt-trade?lawdCd=26440&months=60"),
    fetch("/api/silv-trade?lawdCd=26440&months=60"),
    fetch("/api/apt-rent?lawdCd=26440&months=60"),
    fetch("/api/offi-trade?lawdCd=26440&months=60"),
    fetch("/api/rh-trade?lawdCd=26440&months=60"),
    fetch("/api/offi-rent?lawdCd=26440&months=60"),
    fetch("/api/rh-rent?lawdCd=26440&months=60"),
  ]);
  const [aptData, silvData, rentData, offiData, rhData, offiRentData, rhRentData] = await Promise.all([
    aptRes.json(), silvRes.json(), rentRes.json(), offiRes.json(), rhRes.json(), offiRentRes.json(), rhRentRes.json(),
  ]);
  const base = buildComplexList(aptData.items ?? []);
  const rentOnly = buildRentOnlyComplexes(rentData.items ?? [], new Set(base.map((c) => c.name)));
  const silvComplexes = buildComplexList(
    (silvData.items ?? []).filter((i: RawItem) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );
  const offiComplexes = (() => {
    const offiBase = buildComplexList(offiData.items ?? []);
    const offiRentOnly = buildRentOnlyDynamic(offiRentData.items ?? [], new Set(offiBase.map((c) => c.name)), 8000);
    return [...offiBase, ...offiRentOnly];
  })();
  const rhComplexes = buildComplexList(rhData.items ?? []);
  return {
    aptComplexes: [...base, ...rentOnly],
    silvComplexes,
    rentItems: (rentData.items ?? []) as RentRawItem[],
    offiComplexes,
    rhComplexes,
    offiRentItems: (offiRentData.items ?? []) as RentRawItem[],
    rhRentItems: (rhRentData.items ?? []) as RentRawItem[],
  };
}

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
  return `${v.toLocaleString()}만`;
}

function fmtMan(v: number) { return v.toLocaleString(); }

const PREVIEW = 20;

interface Props {
  selectedApt: AptComplex | null;
  selectedProperty?: SelectedProperty | null;
  isOpen: boolean;
  onClose: () => void;
  sharedArea?: string;
  onAreaChange?: (area: string) => void;
  areaTypeMap?: Record<string, Record<string, string>>;
}

export default function MapTransactionPanel({ selectedApt, selectedProperty, isOpen, onClose, sharedArea, onAreaChange, areaTypeMap = {} }: Props) {
  const { data, isLoading } = useSWR("map-estate-data", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const [tab, setTab] = useState<"매매" | "전월세">("매매");
  const [localArea, setLocalArea] = useState("");
  const selectedArea = sharedArea !== undefined ? sharedArea : localArea;
  const setSelectedArea = onAreaChange ?? setLocalArea;
  const [limit, setLimit] = useState(PREVIEW);

  // 아파트/분양권 데이터
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
  const aptMergedComplex = aptComplex && silvComplex ? mergeComplexes(aptComplex, silvComplex) : aptComplex ?? silvComplex ?? null;

  // 연립/오피스텔 데이터
  const propertyComplex = selectedProperty
    ? (selectedProperty.propertyType === "offi"
        ? (data?.offiComplexes ?? []).find((c) => c.name === selectedProperty.name) ?? null
        : (data?.rhComplexes ?? []).find((c) => c.name === selectedProperty.name) ?? null)
    : null;
  const propertyRentItems = selectedProperty?.propertyType === "offi"
    ? (data?.offiRentItems ?? [])
    : (data?.rhRentItems ?? []);

  // 활성 단지
  const complex = selectedApt ? aptMergedComplex : propertyComplex;
  const activeName = selectedApt ? (aptName ?? "") : (selectedProperty?.name ?? "");
  const activeRentItems = selectedApt
    ? (data?.rentItems ?? [])
    : propertyRentItems.filter((i) => i.aptNm?.trim() === propertyComplex?.name);
  const rentTransactions = complex ? buildRentTransactions(activeRentItems, complex.name) : [];

  useEffect(() => {
    setLimit(PREVIEW);
    setTab("매매");
  }, [complex?.id]);

  useEffect(() => {
    setLimit(PREVIEW);
  }, [tab, selectedArea]);

  const tradeRows = selectedArea
    ? (complex?.transactions ?? []).filter((t) => t.area === selectedArea)
    : (complex?.transactions ?? []);
  const rentRows = selectedArea
    ? rentTransactions.filter((t) => t.area === selectedArea)
    : rentTransactions;

  const rows = tab === "매매" ? tradeRows : rentRows;
  const visibleRows = rows.slice(0, limit);

  const isVisible = isOpen && !!(selectedApt || selectedProperty);

  return (
    <div
      className={`hidden md:flex flex-col absolute left-0 top-0 bottom-0 z-10 bg-white shadow-xl overflow-hidden transition-all duration-300 ${
        isVisible ? "w-[460px]" : "w-0"
      }`}
    >
      {isVisible && (
        <>
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <div className="flex gap-1">
              {(["매매", "전월세"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    tab === t
                      ? "bg-accent text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* 면적 필터 */}
          {complex && (
            <div className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto shrink-0">
              <button
                onClick={(e) => {
                  setSelectedArea("");
                  (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  !selectedArea ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              {complex.areas.map((a) => (
                <button
                  key={a}
                  onClick={(e) => {
                    setSelectedArea(a);
                    (e.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedArea === a
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {a}{getAreaType(areaTypeMap, activeName, a)}㎡
                </button>
              ))}
            </div>
          )}

          {/* 거래 목록 */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-sm text-gray-400 py-12">로딩 중...</div>
            ) : !complex ? (
              <div className="text-center text-sm text-gray-400 py-12">데이터 없음</div>
            ) : rows.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-12">거래 내역이 없습니다</div>
            ) : (
              <>
                <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
                  총 {rows.length}건
                </div>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b border-gray-100">
                    {tab === "매매" ? (
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
                    {tab === "매매"
                      ? visibleRows.map((t: any, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-700">{t.date}</td>
                            <td className="px-3 py-2.5 text-right text-gray-500">{t.dong ?? "-"}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{t.area}{getAreaType(areaTypeMap, activeName, t.area)}㎡</td>
                            <td className="px-3 py-2.5 text-right text-gray-500">{t.floor}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{fmt(t.price)}</td>
                          </tr>
                        ))
                      : visibleRows.map((t: any, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{t.date}</td>
                            <td className="px-2 py-2.5 text-right text-gray-600 whitespace-nowrap">{t.area}{getAreaType(areaTypeMap, activeName, t.area)}㎡</td>
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
                {limit < rows.length && (
                  <button
                    onClick={() => setLimit((v) => v + PREVIEW)}
                    className="w-full py-3 text-xs font-medium text-gray-500 hover:text-gray-800 border-t border-gray-100 transition-colors"
                  >
                    더보기 ({Math.min(PREVIEW, rows.length - limit)}건 더)
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
