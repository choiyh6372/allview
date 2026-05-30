import { NextResponse } from "next/server";

export const revalidate = 86400; // 라우트 응답 자체를 24시간 캐시

const API_BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";
const CACHE_TTL = 86400;

export type SubscriptionItem = {
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  HOUSE_NM: string;
  HOUSE_SECD_NM: string;
  HOUSE_DTL_SECD_NM: string;
  CNSTRCT_ENTRPS_NM: string;
  SUBSCRPT_AREA_CODE_NM: string;
  HSSPLY_ADRES: string;
  TOT_SUPLY_HSHLDCO: string;
  RCRIT_PBLANC_DE: string;
  RCEPT_BGNDE: string;
  RCEPT_ENDDE: string;
  PRZWNER_PRESNATN_DE: string;
  MVNIN_PREARNGE_YM: string;
  PBLANC_URL: string;
  SPECLT_RDN_EARTH_AT: string;
  kind: "apt" | "munorwi";
};

type ApiResponse = { data?: Omit<SubscriptionItem, "kind">[]; totalCount?: number; resultCode?: string; resultMsg?: string };

export async function GET() {
  const apiKey = process.env.APPLYHOME_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured", items: [] }, { status: 500 });
  }

  const compact = (s: string) => (s ?? "").replace(/-/g, "").slice(0, 8);

  const buildQs = (page: number, perPage: number, regionFilter = true) =>
    `serviceKey=${encodeURIComponent(apiKey)}` +
    `&page=${page}&perPage=${perPage}&returnType=JSON` +
    (regionFilter ? `&cond[SUBSCRPT_AREA_CODE_NM::EQ]=${encodeURIComponent("부산")}` : "");

  async function fetchPage(endpoint: string, page: number, perPage: number, regionFilter = true): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE}/${endpoint}?${buildQs(page, perPage, regionFilter)}`, {
      next: { revalidate: CACHE_TTL },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON: ${text.slice(0, 200)}`);
    }
  }

  async function fetchAll(endpoint: string, kind: SubscriptionItem["kind"], regionFilter = true): Promise<SubscriptionItem[]> {
    const first = await fetchPage(endpoint, 1, 100, regionFilter);
    if (first.resultCode && first.resultCode !== "00") return [];

    const totalCount = first.totalCount ?? 0;
    let raw = first.data ?? [];

    if (totalCount > 100) {
      const pageCount = Math.ceil(totalCount / 100);
      const rest = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, i) => fetchPage(endpoint, i + 2, 100, regionFilter))
      );
      for (const r of rest) raw = raw.concat(r.data ?? []);
    }

    // 지역 필터 없이 전체 조회한 경우 주소로 부산 필터링
    const filtered = regionFilter ? raw : raw.filter((item) => (item.HSSPLY_ADRES ?? "").includes("부산"));

    return filtered.map((item) => {
      // 무순위 API는 필드명이 다르므로 정규화
      if (!regionFilter) {
        const r = item as Record<string, string>;
        r.RCEPT_BGNDE = r.SUBSCRPT_RCEPT_BGNDE ?? r.GNRL_RCEPT_BGNDE ?? "";
        r.RCEPT_ENDDE = r.SUBSCRPT_RCEPT_ENDDE ?? r.GNRL_RCEPT_ENDDE ?? "";
        r.MVNIN_PREARNGE_YM = r.MVN_PREARNGE_YM ?? "";
      }
      return { ...item, kind };
    });
  }

  try {
    const [aptItems, munorwiItems] = await Promise.all([
      fetchAll("getAPTLttotPblancDetail", "apt"),
      fetchAll("getRemndrLttotPblancDetail", "munorwi", false).catch(() => [] as SubscriptionItem[]),
    ]);

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    const cutoffStr = cutoff.toISOString().slice(0, 10).replace(/-/g, "");

    const items: SubscriptionItem[] = [...aptItems, ...munorwiItems]
      .filter((item) => {
        const endde = compact(item.RCEPT_ENDDE);
        return !endde || endde >= cutoffStr;
      })
      .sort((a, b) => compact(b.RCEPT_BGNDE).localeCompare(compact(a.RCEPT_BGNDE)));

    return NextResponse.json(
      { items, total: items.length },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
    );
  } catch (err) {
    console.error("Subscription API error:", err);
    return NextResponse.json({ error: String(err), items: [] }, { status: 500 });
  }
}
