import type { RawItem } from "@/app/api/apt-trade/route";
import type { Complex, Transaction, MonthlyPrice } from "./realEstateData";

export type { RawItem };

export async function fetchAptTrade(
  lawdCd = "26440",
  months = 12
): Promise<RawItem[]> {
  try {
    const res = await fetch(
      `/api/apt-trade?lawdCd=${lawdCd}&months=${months}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
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
  months = 24
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

      const monthlyPrices = buildMonthlyPrices(aptItems, 24);

      return { id: idx + 1, name, region, areas, transactions, monthlyPrices };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
