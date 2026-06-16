import { NextRequest, NextResponse } from "next/server";
import {
  fetchAptTradeData,
  fetchSilvTradeData,
  fetchOffiTradeData,
  fetchRHTradeData,
  fetchAptRentData,
  fetchOffiRentData,
  fetchRHRentData,
  type RawItem,
  type RentRawItem,
} from "@/lib/molitApi";
import { getTradeCache, saveTradeCache } from "@/lib/tradeCache";

const EXCLUDE_UMD = new Set(["대항동", "동선동", "성북동", "송정동", "천성동", "눌차동"]);
const LAWD_CD = "26440";
const INITIAL_MONTHS = 60;
const INCREMENTAL_MONTHS = 2;

function tradeKey(i: RawItem): string {
  return `${i.aptNm ?? ""}_${i.dealYear}_${i.dealMonth}_${i.dealDay}_${i.excluUseAr}_${i.floor}_${i.dealAmount}`;
}

function rentKey(i: RentRawItem): string {
  return `${i.aptNm ?? ""}_${i.dealYear}_${i.dealMonth}_${i.dealDay}_${i.excluUseAr}_${i.floor}_${i.deposit}_${i.monthlyRent}`;
}

function mergeTrade(existing: RawItem[], incoming: RawItem[]): RawItem[] {
  const map = new Map(existing.map((i) => [tradeKey(i), i]));
  for (const i of incoming) map.set(tradeKey(i), i);
  return Array.from(map.values());
}

function mergeRent(existing: RentRawItem[], incoming: RentRawItem[]): RentRawItem[] {
  const map = new Map(existing.map((i) => [rentKey(i), i]));
  for (const i of incoming) map.set(rentKey(i), i);
  return Array.from(map.values());
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 기존 apt-trade 캐시 유무로 초기/증분 모드 판단
  const existingApt = await getTradeCache<RawItem>("apt-trade");
  const isInitial = !existingApt || existingApt.length === 0;
  const months = isInitial ? INITIAL_MONTHS : INCREMENTAL_MONTHS;

  try {
    const [aptRaw, silvRaw, offiRaw, rhRaw, aptRentRaw, offiRentRaw, rhRentRaw] =
      await Promise.all([
        fetchAptTradeData(LAWD_CD, months),
        fetchSilvTradeData(LAWD_CD, months),
        fetchOffiTradeData(LAWD_CD, months),
        fetchRHTradeData(LAWD_CD, months),
        fetchAptRentData(LAWD_CD, months),
        fetchOffiRentData(LAWD_CD, months),
        fetchRHRentData(LAWD_CD, months),
      ]);

    // API가 아무것도 반환 안 하면 기존 캐시 유지하고 종료
    const totalFetched = aptRaw.length + silvRaw.length + offiRaw.length + aptRentRaw.length;
    if (totalFetched === 0) {
      return NextResponse.json(
        { ok: false, error: "MOLIT API returned no data — existing cache preserved" },
        { status: 503 }
      );
    }

    const offiTrade = offiRaw.map((i) => ({ ...i, aptNm: i.aptNm ?? i.offiNm }));
    const rhTrade = rhRaw
      .filter((i) => !EXCLUDE_UMD.has((i.umdNm ?? "").trim()))
      .map((i) => ({ ...i, aptNm: i.aptNm ?? i.mhouseNm }));
    const offiRent = offiRentRaw.map((i) => ({ ...i, aptNm: i.aptNm ?? i.offiNm }));
    const rhRent = rhRentRaw
      .filter((i) => !EXCLUDE_UMD.has((i.umdNm ?? "").trim()))
      .map((i) => ({ ...i, aptNm: i.aptNm ?? i.mhouseNm }));

    let finalCounts: Record<string, number>;

    if (isInitial) {
      // 초기: 그냥 저장
      const saves: Promise<void>[] = [];
      if (aptRaw.length > 0) saves.push(saveTradeCache("apt-trade", aptRaw));
      if (silvRaw.length > 0) saves.push(saveTradeCache("silv-trade", silvRaw));
      if (offiTrade.length > 0) saves.push(saveTradeCache("offi-trade", offiTrade));
      if (rhTrade.length > 0) saves.push(saveTradeCache("rh-trade", rhTrade));
      if (aptRentRaw.length > 0) saves.push(saveTradeCache("apt-rent", aptRentRaw));
      if (offiRent.length > 0) saves.push(saveTradeCache("offi-rent", offiRent));
      if (rhRent.length > 0) saves.push(saveTradeCache("rh-rent", rhRent));
      await Promise.all(saves);

      finalCounts = {
        aptTrade: aptRaw.length,
        silvTrade: silvRaw.length,
        offiTrade: offiTrade.length,
        rhTrade: rhTrade.length,
        aptRent: aptRentRaw.length,
        offiRent: offiRent.length,
        rhRent: rhRent.length,
      };
    } else {
      // 증분: 기존 데이터 로드 후 병합
      const [exSilv, exOffi, exRh, exAptRent, exOffiRent, exRhRent] = await Promise.all([
        getTradeCache<RawItem>("silv-trade"),
        getTradeCache<RawItem>("offi-trade"),
        getTradeCache<RawItem>("rh-trade"),
        getTradeCache<RentRawItem>("apt-rent"),
        getTradeCache<RentRawItem>("offi-rent"),
        getTradeCache<RentRawItem>("rh-rent"),
      ]);

      const finalApt = aptRaw.length > 0 ? mergeTrade(existingApt!, aptRaw) : existingApt!;
      const finalSilv = silvRaw.length > 0 && exSilv ? mergeTrade(exSilv, silvRaw) : (exSilv ?? silvRaw);
      const finalOffi = offiTrade.length > 0 && exOffi ? mergeTrade(exOffi, offiTrade) : (exOffi ?? offiTrade);
      const finalRh = rhTrade.length > 0 && exRh ? mergeTrade(exRh, rhTrade) : (exRh ?? rhTrade);
      const finalAptRent = aptRentRaw.length > 0 && exAptRent ? mergeRent(exAptRent, aptRentRaw) : (exAptRent ?? aptRentRaw);
      const finalOffiRent = offiRent.length > 0 && exOffiRent ? mergeRent(exOffiRent, offiRent) : (exOffiRent ?? offiRent);
      const finalRhRent = rhRent.length > 0 && exRhRent ? mergeRent(exRhRent, rhRent) : (exRhRent ?? rhRent);

      const saves: Promise<void>[] = [];
      if (aptRaw.length > 0) saves.push(saveTradeCache("apt-trade", finalApt));
      if (silvRaw.length > 0) saves.push(saveTradeCache("silv-trade", finalSilv));
      if (offiTrade.length > 0) saves.push(saveTradeCache("offi-trade", finalOffi));
      if (rhTrade.length > 0) saves.push(saveTradeCache("rh-trade", finalRh));
      if (aptRentRaw.length > 0) saves.push(saveTradeCache("apt-rent", finalAptRent));
      if (offiRent.length > 0) saves.push(saveTradeCache("offi-rent", finalOffiRent));
      if (rhRent.length > 0) saves.push(saveTradeCache("rh-rent", finalRhRent));
      await Promise.all(saves);

      finalCounts = {
        aptTrade: finalApt.length,
        silvTrade: finalSilv.length,
        offiTrade: finalOffi.length,
        rhTrade: finalRh.length,
        aptRent: finalAptRent.length,
        offiRent: finalOffiRent.length,
        rhRent: finalRhRent.length,
      };
    }

    return NextResponse.json({
      ok: true,
      mode: isInitial ? "initial" : "incremental",
      fetchedMonths: months,
      counts: finalCounts,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
