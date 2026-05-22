import type { RawItem } from "@/app/api/apt-trade/route";
import type { RentRawItem } from "@/app/api/apt-rent/route";
import type { Complex, Transaction, MonthlyPrice, RentTransaction } from "./realEstateData";

export type { RentRawItem };
import { APT_VR_MAP } from "./vrMapping";
import { complexData as vrComplexData } from "./vrData";

export type { RawItem };

async function fetchItems(path: string, lawdCd: string, months: number): Promise<RawItem[]> {
  try {
    const res = await fetch(`${path}?lawdCd=${lawdCd}&months=${months}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export function fetchAptTrade(lawdCd = "26440", months = 12) {
  return fetchItems("/api/apt-trade", lawdCd, months);
}

export function fetchSilvTrade(lawdCd = "26440", months = 12) {
  return fetchItems("/api/silv-trade", lawdCd, months);
}

async function fetchRentItems(lawdCd: string, months: number): Promise<RentRawItem[]> {
  try {
    const res = await fetch(`/api/apt-rent?lawdCd=${lawdCd}&months=${months}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export function fetchAptRent(lawdCd = "26440", months = 12) {
  return fetchRentItems(lawdCd, months);
}

export function buildRentMonthlyPrices(items: RentRawItem[], months = 60): MonthlyPrice[] {
  const byMonth: Record<string, number[]> = {};
  for (const item of items) {
    const rentRaw = (item.monthlyRent ?? "0").replace(/,/g, "").trim();
    if (parseInt(rentRaw || "0") !== 0) continue;
    if (!item.dealYear || !item.dealMonth) continue;
    const key = `${item.dealYear}.${item.dealMonth.padStart(2, "0")}`;
    const deposit = parseInt((item.deposit ?? "0").replace(/,/g, "").trim() || "0");
    if (deposit <= 0) continue;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(deposit);
  }
  const result: MonthlyPrice[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    const prices = byMonth[key];
    if (!prices?.length) continue;
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
    result.push({
      month: key,
      median: Math.round(median / 100) * 100,
      low: Math.round(sorted[0] / 100) * 100,
      high: Math.round(sorted[sorted.length - 1] / 100) * 100,
    });
  }
  return result;
}

export function buildRentTransactions(items: RentRawItem[], aptName: string): RentTransaction[] {
  return items
    .filter((item) => item.aptNm?.trim() === aptName)
    .map((item) => {
      const deposit = Math.round(parseInt((item.deposit ?? "0").replace(/,/g, "").trim() || "0") / 100) * 100;
      const monthlyRent = parseInt((item.monthlyRent ?? "0").replace(/,/g, "").trim() || "0");
      const area = Math.round(parseFloat(item.excluUseAr ?? "0")).toString();
      const month = (item.dealMonth ?? "1").padStart(2, "0");
      const day = (item.dealDay ?? "1").padStart(2, "0");
      return { date: `${item.dealYear}.${month}.${day}`, area, floor: parseInt(item.floor ?? "1") || 1, deposit, monthlyRent };
    })
    .filter((t) => t.deposit > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function toTransaction(item: RawItem): Transaction {
  const priceRaw = (item.dealAmount ?? "0").replace(/,/g, "").trim();
  const price = Math.round(parseInt(priceRaw || "0") / 100) * 100;
  const areaRaw = parseFloat(item.excluUseAr ?? "0");
  const area = Math.round(areaRaw).toString();
  const month = (item.dealMonth ?? "1").padStart(2, "0");
  const day = (item.dealDay ?? "1").padStart(2, "0");

  return {
    date: `${item.dealYear}.${month}.${day}`,
    area,
    floor: parseInt(item.floor ?? "1") || 1,
    price,
  };
}

export function buildMonthlyPrices(
  items: RawItem[],
  months = 60
): MonthlyPrice[] {
  const byMonth: Record<string, number[]> = {};

  for (const item of items) {
    if (!item.dealYear || !item.dealMonth) continue;
    const key = `${item.dealYear}.${item.dealMonth.padStart(2, "0")}`;
    const priceRaw = (item.dealAmount ?? "0").replace(/,/g, "").trim();
    const price = parseInt(priceRaw || "0");
    if (price <= 0) continue;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(price);
  }

  const result: MonthlyPrice[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    const prices = byMonth[key];
    if (!prices || prices.length === 0) continue;

    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        : sorted[mid];

    result.push({
      month: key,
      median: Math.round(median / 100) * 100,
      low: Math.round(sorted[0] / 100) * 100,
      high: Math.round(sorted[sorted.length - 1] / 100) * 100,
    });
  }

  return result;
}

export function buildComplexList(items: RawItem[]): Complex[] {
  const byApt = new Map<string, RawItem[]>();

  for (const item of items) {
    const name = item.aptNm?.trim();
    if (!name) continue;
    const group = byApt.get(name) ?? [];
    group.push(item);
    byApt.set(name, group);
  }

  return Array.from(byApt.entries())
    .map(([name, aptItems], idx) => {
      const region = aptItems[0].umdNm?.trim() ?? "";

      const areas = Array.from(
        new Set(
          aptItems
            .map((i) => String(Math.round(parseFloat(i.excluUseAr ?? "0"))))
            .filter((a) => a !== "0")
        )
      ).sort((a, b) => parseInt(a) - parseInt(b));

      const transactions = aptItems
        .map(toTransaction)
        .filter((t) => t.price > 0)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 50);

      const monthlyPrices = buildMonthlyPrices(aptItems, 60);

      const monthlyPricesByArea: Record<string, MonthlyPrice[]> = {};
      for (const area of areas) {
        const areaItems = aptItems.filter(
          (i) => String(Math.round(parseFloat(i.excluUseAr ?? "0"))) === area
        );
        monthlyPricesByArea[area] = buildMonthlyPrices(areaItems, 60);
      }

      const vrMap = APT_VR_MAP[name];
      const vrInfo = vrMap
        ? {
            ...vrMap,
            types:
              vrComplexData.find(
                (c) => c.regionId === vrMap.regionId && c.slug === vrMap.slug
              )?.types ?? [],
          }
        : undefined;

      return { id: idx + 1, name, region, areas, monthlyPrices, monthlyPricesByArea, transactions, vrInfo };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
