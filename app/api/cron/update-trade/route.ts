import { NextRequest, NextResponse } from "next/server";
import {
  fetchAptTradeData,
  fetchSilvTradeData,
  fetchOffiTradeData,
  fetchRHTradeData,
  fetchAptRentData,
  fetchOffiRentData,
  fetchRHRentData,
} from "@/lib/molitApi";
import { saveTradeCache } from "@/lib/tradeCache";

const EXCLUDE_UMD = new Set(["대항동", "동선동", "성북동", "송정동", "천성동", "눌차동"]);
const LAWD_CD = "26440";
const MONTHS = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [aptTrade, silvTrade, offiTradeRaw, rhTradeRaw, aptRent, offiRentRaw, rhRentRaw] =
      await Promise.all([
        fetchAptTradeData(LAWD_CD, MONTHS),
        fetchSilvTradeData(LAWD_CD, MONTHS),
        fetchOffiTradeData(LAWD_CD, MONTHS),
        fetchRHTradeData(LAWD_CD, MONTHS),
        fetchAptRentData(LAWD_CD, MONTHS),
        fetchOffiRentData(LAWD_CD, MONTHS),
        fetchRHRentData(LAWD_CD, MONTHS),
      ]);

    const offiTrade = offiTradeRaw.map((i) => ({ ...i, aptNm: i.aptNm ?? i.offiNm }));
    const rhTrade = rhTradeRaw
      .filter((i) => !EXCLUDE_UMD.has((i.umdNm ?? "").trim()))
      .map((i) => ({ ...i, aptNm: i.aptNm ?? i.mhouseNm }));
    const offiRent = offiRentRaw.map((i) => ({ ...i, aptNm: i.aptNm ?? i.offiNm }));
    const rhRent = rhRentRaw
      .filter((i) => !EXCLUDE_UMD.has((i.umdNm ?? "").trim()))
      .map((i) => ({ ...i, aptNm: i.aptNm ?? i.mhouseNm }));

    await Promise.all([
      saveTradeCache("apt-trade", aptTrade),
      saveTradeCache("silv-trade", silvTrade),
      saveTradeCache("offi-trade", offiTrade),
      saveTradeCache("rh-trade", rhTrade),
      saveTradeCache("apt-rent", aptRent),
      saveTradeCache("offi-rent", offiRent),
      saveTradeCache("rh-rent", rhRent),
    ]);

    return NextResponse.json({
      ok: true,
      counts: {
        aptTrade: aptTrade.length,
        silvTrade: silvTrade.length,
        offiTrade: offiTrade.length,
        rhTrade: rhTrade.length,
        aptRent: aptRent.length,
        offiRent: offiRent.length,
        rhRent: rhRent.length,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
