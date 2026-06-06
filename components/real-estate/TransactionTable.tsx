"use client";

import { useState, useEffect } from "react";
import type { Complex, RentTransaction } from "@/lib/realEstateData";
import { getAreaType } from "@/lib/aptTradeApi";
import type { AreaTypeMap } from "@/lib/parseAptMapping";

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
  return `${v.toLocaleString()}만`;
}

function fmtMan(v: number) {
  return v.toLocaleString();
}

function RentPrice({ deposit, monthlyRent }: { deposit: number; monthlyRent: number }) {
  if (monthlyRent === 0) {
    return <span className="font-semibold text-inherit">{fmt(deposit)}</span>;
  }
  return (
    <span className="font-semibold text-inherit">
      {fmtMan(deposit)} / {fmtMan(monthlyRent)}
    </span>
  );
}

function RentBadge({ monthlyRent }: { monthlyRent: number }) {
  if (monthlyRent === 0) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">전세</span>
    );
  }
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">월세</span>
  );
}

const PREVIEW = 10;

interface Props {
  complex: Complex;
  rentTransactions: RentTransaction[];
  selectedArea: string;
  light?: boolean;
  areaTypeMap?: AreaTypeMap;
}

export default function TransactionTable({ complex, rentTransactions, selectedArea, light, areaTypeMap = {} }: Props) {
  const [tradeLimit, setTradeLimit] = useState(PREVIEW);
  const [rentLimit, setRentLimit] = useState(PREVIEW);

  useEffect(() => {
    setTradeLimit(PREVIEW);
    setRentLimit(PREVIEW);
  }, [complex.id, selectedArea]);

  const tradeRows = selectedArea
    ? complex.transactions.filter((t) => t.area === selectedArea)
    : complex.transactions;
  const rentRows = selectedArea
    ? rentTransactions.filter((t) => t.area === selectedArea)
    : rentTransactions;

  const visibleTrade = tradeRows.slice(0, tradeLimit);
  const visibleRent  = rentRows.slice(0, rentLimit);

  const card    = "bg-white border-gray-200";
  const divRow  = "divide-gray-100";
  const hdr     = "border-b border-gray-200";
  const stickyBg = "bg-white";
  const hover   = "hover:bg-gray-50";
  const txt     = "text-gray-900";
  const sub     = "text-gray-600";
  const cell    = "text-gray-800";

  return (
    <div className={`grid gap-4 ${light ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
      {/* 매매 */}
      <div className={`${card} border rounded-2xl overflow-hidden`}>
        <div className={`px-6 py-4 ${hdr} flex items-center justify-between`}>
          <h2 className={`text-sm font-semibold ${txt}`}>매매</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-500">국토부 실거래</span>
            <span className={`text-xs ${sub}`}>총 {tradeRows.length}건</span>
          </div>
        </div>
        {tradeRows.length === 0 ? (
          <div className={`px-6 py-10 text-center text-sm ${sub}`}>거래 내역이 없습니다</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className={stickyBg}>
                <tr className={hdr}>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${sub}`}>거래일</th>
                  <th className={`text-right px-4 py-3 text-xs font-medium ${sub}`}>동</th>
                  <th className={`text-right px-4 py-3 text-xs font-medium ${sub}`}>면적</th>
                  <th className={`text-right px-4 py-3 text-xs font-medium ${sub}`}>층</th>
                  <th className={`text-right px-6 py-3 text-xs font-medium ${sub}`}>거래가</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${divRow}`}>
                {visibleTrade.map((t, i) => (
                  <tr key={i} className={`${hover} transition-colors`}>
                    <td className={`px-6 py-3 ${cell}`}>{t.date}</td>
                    <td className={`px-4 py-3 text-right ${sub}`}>{t.dong ?? "-"}</td>
                    <td className={`px-4 py-3 text-right ${cell}`}>{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
                    <td className={`px-4 py-3 text-right ${sub}`}>{t.floor}</td>
                    <td className={`px-6 py-3 text-right ${txt}`}>
                      <span className="font-semibold">{fmt(t.price)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tradeLimit < tradeRows.length && (
              <button
                onClick={() => setTradeLimit((v) => v + PREVIEW)}
                className={`w-full py-2.5 text-xs font-medium border-t ${hdr} ${sub} hover:text-gray-800 transition-colors`}
              >
                더보기 ({Math.min(PREVIEW, tradeRows.length - tradeLimit)}건 더)
              </button>
            )}
          </>
        )}
      </div>

      {/* 전월세 */}
      <div className={`${card} border rounded-2xl overflow-hidden`}>
        <div className={`px-6 py-4 ${hdr} flex items-center justify-between`}>
          <h2 className={`text-sm font-semibold ${txt}`}>전월세</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-500">국토부 실거래</span>
            <span className={`text-xs ${sub}`}>총 {rentRows.length}건</span>
          </div>
        </div>
        {rentRows.length === 0 ? (
          <div className={`px-6 py-10 text-center text-sm ${sub}`}>거래 내역이 없습니다</div>
        ) : light ? (
          <>
            <table className="w-full text-sm">
              <thead className={stickyBg}>
                <tr className={hdr}>
                  <th className={`text-left px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>거래일</th>
                  <th className={`text-right px-2 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>면적</th>
                  <th className={`text-right px-1 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>층</th>
                  <th className={`text-right px-1 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>유형</th>
                  <th className={`text-right px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>보증/월세(만원)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${divRow} ${txt}`}>
                {visibleRent.map((t, i) => (
                  <tr key={i} className={`${hover} transition-colors`}>
                    <td className={`px-3 py-3 ${cell} whitespace-nowrap`}>{t.date}</td>
                    <td className={`px-2 py-3 text-right ${cell} whitespace-nowrap`}>{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
                    <td className={`px-1 py-3 text-right ${sub} whitespace-nowrap`}>{t.floor}</td>
                    <td className="px-1 py-3 text-right whitespace-nowrap">
                      <RentBadge monthlyRent={t.monthlyRent} />
                    </td>
                    <td className={`px-3 py-3 text-right ${txt} whitespace-nowrap`}>
                      <RentPrice deposit={t.deposit} monthlyRent={t.monthlyRent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rentLimit < rentRows.length && (
              <button
                onClick={() => setRentLimit((v) => v + PREVIEW)}
                className={`w-full py-2.5 text-xs font-medium border-t ${hdr} ${sub} hover:text-gray-800 transition-colors`}
              >
                더보기 ({Math.min(PREVIEW, rentRows.length - rentLimit)}건 더)
              </button>
            )}
          </>
        ) : (
          <>
            <table className={`w-full text-sm ${txt}`}>
              <thead className={stickyBg}>
                <tr className={hdr}>
                  <th className={`text-left px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>거래일</th>
                  <th className={`text-right px-2 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>면적</th>
                  <th className={`text-right px-1 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>층</th>
                  <th className={`text-right px-1 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>유형</th>
                  <th className={`text-right px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>보증/월세(만원)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${divRow}`}>
                {visibleRent.map((t, i) => (
                  <tr key={i} className={`${hover} transition-colors`}>
                    <td className={`px-3 py-3 ${cell} whitespace-nowrap`}>{t.date}</td>
                    <td className={`px-2 py-3 text-right ${cell} whitespace-nowrap`}>{t.area}{getAreaType(areaTypeMap, complex.name, t.area)}㎡</td>
                    <td className={`px-1 py-3 text-right ${sub} whitespace-nowrap`}>{t.floor}</td>
                    <td className="px-1 py-3 text-right whitespace-nowrap">
                      <RentBadge monthlyRent={t.monthlyRent} />
                    </td>
                    <td className={`px-3 py-3 text-right ${txt} whitespace-nowrap`}>
                      <RentPrice deposit={t.deposit} monthlyRent={t.monthlyRent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rentLimit < rentRows.length && (
              <button
                onClick={() => setRentLimit((v) => v + PREVIEW)}
                className={`w-full py-2.5 text-xs font-medium border-t ${hdr} ${sub} hover:text-gray-800 transition-colors`}
              >
                더보기 ({Math.min(PREVIEW, rentRows.length - rentLimit)}건 더)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
