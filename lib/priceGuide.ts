import type { RawItem, RentRawItem } from "@/lib/molitApi";

// 단지 실거래가 페이지의 "가격 판단 기준": 같은 전용면적 거래로 중앙값·사분위·층별 차이·전세가율을 계산한다.
// 직거래는 시세와 다르게 신고되는 경우가 많아 기준 계산에서 뺀다.

const MIN_DEALS = 5;
const MAX_AREAS = 3;

const man = (s?: string) => parseInt((s ?? "0").replace(/,/g, ""), 10) || 0;
const keyOf = (i: { dealYear?: string; dealMonth?: string; dealDay?: string }) =>
  `${i.dealYear}${String(i.dealMonth).padStart(2, "0")}${String(i.dealDay).padStart(2, "0")}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

/** 선형 보간 분위수 (만원 단위 정수로 반올림) */
export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

const FLOOR_BANDS: { label: string; min: number; max: number }[] = [
  { label: "1~5층", min: -99, max: 5 },
  { label: "6~10층", min: 6, max: 10 },
  { label: "11~15층", min: 11, max: 15 },
  { label: "16~20층", min: 16, max: 20 },
  { label: "21층 이상", min: 21, max: 999 },
];

export interface AreaPriceGuide {
  /** 신고된 전용면적 문자열 그대로 */
  area: string;
  /** 집계 기간: 최근 1년 또는 2년 */
  years: 1 | 2;
  count: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  /** 1억 단위 가격대 분포 (거래가 있는 구간만) */
  bands: { label: string; count: number }[];
  /** 층 구간별 중앙값 (2건 이상인 구간만) */
  floors: { label: string; count: number; median: number }[];
  /** 최근 3개월 중앙값 (3건 이상일 때) */
  recentMedian?: number;
  recentCount?: number;
  /** 같은 면적 전세 중앙값과 전세가율 (최근 1년 전세 3건 이상일 때) */
  jeonseMedian?: number;
  jeonseCount?: number;
  jeonseRatio?: number;
}

export function buildPriceGuides(trades: RawItem[], rents: RentRawItem[]): AreaPriceGuide[] {
  const usable = trades.filter((t) => t.dealingGbn !== "직거래" && man(t.dealAmount) > 0);
  const oneYear = daysAgo(365), twoYears = daysAgo(730), threeMonths = daysAgo(92);

  const byArea = new Map<string, RawItem[]>();
  for (const t of usable) {
    const area = (t.excluUseAr ?? "").trim();
    if (!area || keyOf(t) < twoYears) continue;
    byArea.set(area, [...(byArea.get(area) ?? []), t]);
  }

  const guides: AreaPriceGuide[] = [];
  for (const [area, all] of Array.from(byArea.entries())) {
    const inYear = all.filter((t) => keyOf(t) >= oneYear);
    const years: 1 | 2 = inYear.length >= MIN_DEALS ? 1 : 2;
    const list = years === 1 ? inYear : all;
    if (list.length < MIN_DEALS) continue;

    const amts = list.map((t) => man(t.dealAmount)).sort((a, b) => a - b);
    const median = quantile(amts, 0.5);

    const bandMap = new Map<number, number>();
    for (const a of amts) bandMap.set(Math.floor(a / 10000), (bandMap.get(Math.floor(a / 10000)) ?? 0) + 1);
    const bands = Array.from(bandMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([eok, count]) => ({ label: eok ? `${eok}억대` : "1억 미만", count }));

    const floors = FLOOR_BANDS.map((b) => {
      const f = list.filter((t) => {
        const n = parseInt(t.floor ?? "", 10);
        return !Number.isNaN(n) && n >= b.min && n <= b.max;
      });
      const s = f.map((t) => man(t.dealAmount)).sort((x, y) => x - y);
      return { label: b.label, count: f.length, median: quantile(s, 0.5) };
    }).filter((f) => f.count >= 2);

    const recent = list.filter((t) => keyOf(t) >= threeMonths).map((t) => man(t.dealAmount)).sort((a, b) => a - b);

    const jeonse = rents
      .filter((r) => (r.excluUseAr ?? "").trim() === area && !man(r.monthlyRent) && man(r.deposit) > 0 && keyOf(r) >= oneYear)
      .map((r) => man(r.deposit))
      .sort((a, b) => a - b);

    const guide: AreaPriceGuide = {
      area, years, count: list.length, median,
      p25: quantile(amts, 0.25), p75: quantile(amts, 0.75),
      min: amts[0], max: amts[amts.length - 1],
      bands, floors,
    };
    if (recent.length >= 3) Object.assign(guide, { recentMedian: quantile(recent, 0.5), recentCount: recent.length });
    if (jeonse.length >= 3) {
      const jm = quantile(jeonse, 0.5);
      Object.assign(guide, { jeonseMedian: jm, jeonseCount: jeonse.length, jeonseRatio: Math.round((jm / median) * 100) });
    }
    guides.push(guide);
  }

  // 거래가 많은 면적부터 최대 3개
  return guides.sort((a, b) => b.count - a.count).slice(0, MAX_AREAS).sort((a, b) => parseFloat(a.area) - parseFloat(b.area));
}
