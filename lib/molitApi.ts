const API_KEY = process.env.MOLIT_API_KEY ?? "";
export const CACHE_TTL = 86400;

export interface RawItem {
  aptNm?: string;
  aptDong?: string;
  buildYear?: string;
  buyerGbn?: string;
  slerGbn?: string;
  cdealDay?: string;
  cdealType?: string;
  dealAmount?: string;
  dealDay?: string;
  dealMonth?: string;
  dealYear?: string;
  dealingGbn?: string;
  estateAgentSggNm?: string;
  excluUseAr?: string;
  floor?: string;
  jibun?: string;
  landLeaseholdGbn?: string;
  rgstDate?: string;
  sggCd?: string;
  umdNm?: string;
  ownershipGbn?: string;
  sggNm?: string;
}

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

function parseXmlItems(xml: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const obj: Record<string, string> = {};
    const fieldRe = /<([^/>\s][^>]*)>([\s\S]*?)<\/\1>/g;
    let f: RegExpExecArray | null;
    while ((f = fieldRe.exec(block)) !== null) obj[f[1]] = f[2].trim();
    items.push(obj);
  }
  return items;
}

async function fetchMonths<T>(
  baseUrl: string,
  lawdCd: string,
  months: number
): Promise<T[]> {
  const now = new Date();
  const dealYmds: string[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dealYmds.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const results = await Promise.all(
    dealYmds.map(async (dealYmd) => {
      const url = new URL(baseUrl);
      url.searchParams.set("serviceKey", API_KEY);
      url.searchParams.set("LAWD_CD", lawdCd);
      url.searchParams.set("DEAL_YMD", dealYmd);
      url.searchParams.set("pageNo", "1");
      url.searchParams.set("numOfRows", "1000");
      try {
        const res = await fetch(url.toString(), { next: { revalidate: CACHE_TTL } });
        if (!res.ok) return [] as T[];
        const xml = await res.text();
        if (
          xml.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR") ||
          xml.includes("<resultCode>E</resultCode>")
        ) return [] as T[];
        return parseXmlItems(xml) as unknown as T[];
      } catch {
        return [] as unknown as T[];
      }
    })
  );
  return results.flat();
}

export function fetchAptTradeData(lawdCd = "26440", months = 60): Promise<RawItem[]> {
  return fetchMonths<RawItem>(
    "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade",
    lawdCd,
    months
  );
}

export function fetchSilvTradeData(lawdCd = "26440", months = 60): Promise<RawItem[]> {
  return fetchMonths<RawItem>(
    "https://apis.data.go.kr/1613000/RTMSDataSvcSilvTrade/getRTMSDataSvcSilvTrade",
    lawdCd,
    months
  );
}

export function fetchAptRentData(lawdCd = "26440", months = 60): Promise<RentRawItem[]> {
  return fetchMonths<RentRawItem>(
    "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent",
    lawdCd,
    months
  );
}
