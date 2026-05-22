import { NextResponse } from "next/server";
import { complexData } from "@/lib/vrData";
import { getAllStores } from "@/lib/promotionStore";

export const revalidate = 86400;

const API_KEY = process.env.MOLIT_API_KEY ?? "";
const APT_BASE =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";

async function countMonth(lawdCd: string, dealYmd: string): Promise<number> {
  if (!API_KEY) return 0;
  const url = new URL(APT_BASE);
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("LAWD_CD", lawdCd);
  url.searchParams.set("DEAL_YMD", dealYmd);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1000");
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return 0;
    const xml = await res.text();
    return (xml.match(/<item>/g) ?? []).length;
  } catch {
    return 0;
  }
}

export async function GET() {
  const vrComplexes = complexData.length;
  const vrTypes = complexData.reduce((s, c) => s + c.types.length, 0);

  const now = new Date();
  const months = Array.from({ length: 60 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const counts = await Promise.all(months.map((m) => countMonth("26440", m)));
  const transactions = counts.reduce((a, b) => a + b, 0);

  const stores = await getAllStores();

  return NextResponse.json({ vrComplexes, vrTypes, transactions, stores: stores.length });
}
