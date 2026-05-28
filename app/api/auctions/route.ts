import { NextResponse } from "next/server";

const ENDPOINT = "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2";
const CACHE_TTL = 60 * 60 * 3;

export interface AuctionItem {
  id: string;
  address: string;
  district: string;
  appraisedAmt: number;
  minBidAmt: number;
  startDt: string;
  endDt: string;
  category: string;
  onbidUrl: string;
}

function yyyymmdd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

const TARGET_DISTRICTS = ["강서구", "사상구", "사하구", "북구"];

export async function GET() {
  const key = process.env.ONBID_API_KEY ?? process.env.MOLIT_API_KEY;
  if (!key) return NextResponse.json({ items: [], error: "API 키 미설정" });

  const now = new Date();
  const future = new Date(now);
  future.setMonth(future.getMonth() + 3);
  const from = new Date(now);
  from.setMonth(from.getMonth() - 3);

  try {
    const params = new URLSearchParams({
      serviceKey: key,
      pageNo: "1",
      numOfRows: "500",
      resultType: "json",
      prptDivCd: "0007,0005",
      bidDivCd: "0001",
      pvctTrgtYn: "N",
      dspsMthodCd: "0001",
      cltrUsgLclsCtgrId: "10000",
      cltrUsgLclsCtgrNm: "부동산",
      lctnSdnm: "부산광역시",
      bidPrdYmdStart: yyyymmdd(now),
      bidPrdYmdEnd: yyyymmdd(future),
      cptnMthodCd: "0001",
      cptnMthodNm: "일반경쟁",
      alcYn: "N",
      mdfcnYmdStart: yyyymmdd(from),
      mdfcnYmdEnd: yyyymmdd(now),
    });

    const r = await fetch(`${ENDPOINT}?${params}`, { cache: "no-store" });
    const text = await r.text();
    console.log(`[auctions] status=${r.status} body=`, text.slice(0, 400));

    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ items: [], error: "XML 응답: " + text.slice(0, 200) });
    }

    const raw = data?.body?.items?.item ?? [];
    const list: any[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const first = list[0] ?? {};
    console.log(`[auctions] 총 ${list.length}건`);
    console.log(`[auctions] 필드키:`, Object.keys(first).join(", "));
    const locFields = ["lctnSdnm","lctnSggnm","lctnEmdNm","onbidCltrNm","cltrNm","adrs","nmrdAdrs","ldnmAdrs"];
    const locSample: any = {};
    locFields.forEach(f => { if (first[f] !== undefined) locSample[f] = first[f]; });
    console.log(`[auctions] 위치필드:`, JSON.stringify(locSample));

    const items: AuctionItem[] = list
      .filter((i) => {
        const addr = (i.lctnSggnm ?? i.onbidCltrNm ?? "");
        return TARGET_DISTRICTS.some((d) => addr.includes(d));
      })
      .map((i) => {
        const addr = (i.onbidCltrNm ?? i.lctnSdnm ?? "").trim();
        const district = TARGET_DISTRICTS.find((d) => (i.lctnSggnm ?? addr).includes(d)) ?? "";
        return {
          id: i.cltrMngNo ?? String(Math.random()),
          address: addr,
          district,
          appraisedAmt: parseInt((i.apslEvlAmt ?? "0").replace(/,/g, "")) || 0,
          minBidAmt: parseInt((i.lowstBidPrc ?? "0").replace(/,/g, "")) || 0,
          startDt: (i.bidPrdYmdStart ?? "").slice(0, 10),
          endDt: (i.bidPrdYmdEnd ?? "").slice(0, 10),
          category: i.cltrUsgLclsCtgrNm ?? "부동산",
          onbidUrl: `https://www.onbid.co.kr/op/cta/cltrdtl/collateralRealEstateDetail.do?cltrMngNo=${i.cltrMngNo ?? ""}`,
        };
      });

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
    );
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) });
  }
}
