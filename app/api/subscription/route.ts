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
};

export async function GET() {
  const apiKey = process.env.APPLYHOME_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured", items: [] }, { status: 500 });
  }

  const compact = (s: string) => (s ?? "").replace(/-/g, "").slice(0, 8);

  const buildQs = (page: number, perPage: number) =>
    `serviceKey=${encodeURIComponent(apiKey)}` +
    `&page=${page}&perPage=${perPage}&returnType=JSON` +
    `&cond[SUBSCRPT_AREA_CODE_NM::EQ]=${encodeURIComponent("부산")}`;

  type ApiResponse = { data?: SubscriptionItem[]; totalCount?: number; resultCode?: string; resultMsg?: string };

  async function fetchPage(page: number, perPage: number): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE}/getAPTLttotPblancDetail?${buildQs(page, perPage)}`, {
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

  try {
    // 1차: totalCount 파악
    const first = await fetchPage(1, 100);
    if (first.resultCode && first.resultCode !== "00") {
      throw new Error(`API error: ${first.resultMsg}`);
    }

    const totalCount = first.totalCount ?? 0;
    let allData: SubscriptionItem[] = first.data ?? [];

    // totalCount 가 100 초과면 나머지 페이지 병렬 패치
    if (totalCount > 100) {
      const pageCount = Math.ceil(totalCount / 100);
      const rest = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, i) => fetchPage(i + 2, 100))
      );
      for (const r of rest) allData = allData.concat(r.data ?? []);
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    const cutoffStr = cutoff.toISOString().slice(0, 10).replace(/-/g, "");

    const items: SubscriptionItem[] = allData
      .filter((item) => {
        const endde = compact(item.RCEPT_ENDDE);
        // 종료일이 없거나(청약예정), 3개월 이내인 것만 포함
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
