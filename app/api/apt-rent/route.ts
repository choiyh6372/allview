import { NextResponse } from "next/server";

const API_KEY = process.env.MOLIT_API_KEY ?? "";

const BASE_URL =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent";

const CACHE_TTL = 86400;

export interface RentRawItem {
  aptNm?: string;
  excluUseAr?: string;
  floor?: string;
  dealYear?: string;
  dealMonth?: string;
  dealDay?: string;
  deposit?: string;
  monthlyRent?: string;
  umdNm?: string;
  contractType?: string;
}

function parseXmlItems(xml: string): RentRawItem[] {
  const items: RentRawItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const obj: Record<string, string> = {};
    const fieldRe = /<([^/>\s][^>]*)>([\s\S]*?)<\/\1>/g;
    let f: RegExpExecArray | null;
    while ((f = fieldRe.exec(block)) !== null) {
      obj[f[1]] = f[2].trim();
    }
    items.push(obj as unknown as RentRawItem);
  }
  return items;
}

async function fetchMonth(lawdCd: string, dealYmd: string): Promise<RentRawItem[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("LAWD_CD", lawdCd);
  url.searchParams.set("DEAL_YMD", dealYmd);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1000");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: CACHE_TTL },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    if (
      xml.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR") ||
      xml.includes("<resultCode>E</resultCode>")
    ) {
      return [];
    }
    return parseXmlItems(xml);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawdCd = searchParams.get("lawdCd") ?? "26440";
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 60);

  const now = new Date();
  const dealYmds: string[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dealYmds.push(
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  const results = await Promise.all(dealYmds.map((ym) => fetchMonth(lawdCd, ym)));
  const items = results.flat();

  return NextResponse.json(
    { items, count: items.length },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate`,
      },
    }
  );
}
