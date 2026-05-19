import { NextResponse } from "next/server";

const API_KEY =
  "39a990dd250e992b303d7a6a3bcc8d9a5b73d019db35d073d5b46ffe59f89518";

const BASE_URL =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";

/** 하루 단위 캐시 (86400초) */
const CACHE_TTL = 86400;

export interface RawItem {
  aptNm: string;
  aptDong: string;
  buildYear: string;
  buyerGbn: string;
  slerGbn: string;
  cdealDay: string;
  cdealType: string;
  dealAmount: string;
  dealDay: string;
  dealMonth: string;
  dealYear: string;
  dealingGbn: string;
  estateAgentSggNm: string;
  excluUseAr: string;
  floor: string;
  jibun: string;
  landLeaseholdGbn: string;
  rgstDate: string;
  sggCd: string;
  umdNm: string;
}

function parseXmlItems(xml: string): RawItem[] {
  const items: RawItem[] = [];
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
    items.push(obj as unknown as RawItem);
  }
  return items;
}

async function fetchMonth(lawdCd: string, dealYmd: string): Promise<RawItem[]> {
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
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 24);

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
