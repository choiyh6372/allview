import type { RawItem, RentRawItem } from "@/lib/molitApi";
import type { AptComplex } from "@/lib/mapData";
import type { ComplexTradeData } from "@/lib/complexTrades";
import { quantile } from "@/lib/priceGuide";

// 지역 시세 비교 페이지: 단지별 최근 1년 거래로 대표 면적 중앙값·3.3㎡당 가격·전세가율을 계산한다.
// 직거래는 빼고, 매매가 5건 미만인 신축 단지는 분양권 거래로 계산한다.

const MIN_TRADES = 5;
const MIN_SILVS = 3;
const PYEONG = 3.3058;

const man = (s?: string) => parseInt((s ?? "0").replace(/,/g, ""), 10) || 0;
const keyOf = (i: { dealYear?: string; dealMonth?: string; dealDay?: string }) =>
  `${i.dealYear}${String(i.dealMonth).padStart(2, "0")}${String(i.dealDay).padStart(2, "0")}`;
const areaOf = (i: { excluUseAr?: string }) => (i.excluUseAr ?? "").trim();

export interface ComplexCompareRow {
  apt: AptComplex;
  /** 계산에 쓴 거래 종류 */
  basis: "매매" | "분양권" | null;
  /** 최근 1년 매매 건수 (직거래 포함 전체) */
  tradeCount: number;
  /** 최근 1년 분양권 건수 */
  silvCount: number;
  /** 가장 많이 거래된 전용면적 (신고값 그대로) */
  repArea?: string;
  repCount?: number;
  repMedian?: number;
  /** 공급면적 3.3㎡당 가격 중앙값 (만원) */
  perPyeong?: number;
  perPyeongCount?: number;
  /** 대표 면적 전세 중앙값과 전세가율 */
  jeonseMedian?: number;
  jeonseRatio?: number;
}

export function buildCompareRow(
  apt: AptComplex,
  data: ComplexTradeData,
  supplyMap: Record<string, number>,
  yearAgo: string,
): ComplexCompareRow {
  const inYear = <T extends { dealYear?: string; dealMonth?: string; dealDay?: string }>(l: T[]) => l.filter((t) => keyOf(t) >= yearAgo);
  const trades = inYear(data.trades);
  const silvs = inYear(data.silvs);
  const usableTrades = trades.filter((t) => t.dealingGbn !== "직거래" && man(t.dealAmount) > 0);
  const usableSilvs = silvs.filter((t) => t.dealingGbn !== "직거래" && man(t.dealAmount) > 0);

  const basis = usableTrades.length >= MIN_TRADES ? "매매" : usableSilvs.length >= MIN_SILVS ? "분양권" : null;
  const row: ComplexCompareRow = { apt, basis, tradeCount: trades.length, silvCount: silvs.length };
  if (!basis) return row;
  const deals: RawItem[] = basis === "매매" ? usableTrades : usableSilvs;

  const byArea = new Map<string, RawItem[]>();
  for (const d of deals) byArea.set(areaOf(d), [...(byArea.get(areaOf(d)) ?? []), d]);
  const [repArea, repDeals] = Array.from(byArea.entries()).sort((a, b) => b[1].length - a[1].length)[0];
  const repAmts = repDeals.map((d) => man(d.dealAmount)).sort((a, b) => a - b);
  Object.assign(row, { repArea, repCount: repDeals.length, repMedian: quantile(repAmts, 0.5) });

  const per = deals
    .map((d) => {
      const supply = supplyMap[String(parseFloat(areaOf(d)))];
      return supply ? man(d.dealAmount) / (supply / PYEONG) : 0;
    })
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (per.length >= 3) Object.assign(row, { perPyeong: quantile(per, 0.5), perPyeongCount: per.length });

  if (basis === "매매") {
    const jeonse = inYear(data.rents as RentRawItem[])
      .filter((r) => areaOf(r) === repArea && !man(r.monthlyRent) && man(r.deposit) > 0)
      .map((r) => man(r.deposit))
      .sort((a, b) => a - b);
    if (jeonse.length >= 3 && row.repMedian) {
      const jm = quantile(jeonse, 0.5);
      Object.assign(row, { jeonseMedian: jm, jeonseRatio: Math.round((jm / row.repMedian) * 100) });
    }
  }
  return row;
}
