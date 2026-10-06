import { getTradeCache } from "@/lib/tradeCache";
import { APT_COMPLEXES, type AptComplex } from "@/lib/mapData";
import { complexData } from "@/lib/vrData";
import type { RawItem, RentRawItem } from "@/lib/molitApi";

// 단지별 실거래가 페이지용: R2 실거래 캐시에서 특정 단지의 매매·전월세 거래를 골라낸다

/** VR투어와 지도에 함께 등록된 모든 단지의 실거래가 페이지를 제공한다. */
const MAPPED_COMPLEX_IDS = new Set(APT_COMPLEXES.map((complex) => complex.id));
export const TRADE_PAGE_COMPLEXES = complexData
  .filter((complex) => MAPPED_COMPLEX_IDS.has(complex.id))
  .map((complex) => complex.id);

const norm = (s?: string) => (s ?? "").replace(/[\s·\-]/g, "");
const jibunOf = (apt: AptComplex) => apt.legalAddress?.match(/명지동 ([0-9-]+)$/)?.[1];

/** 이 단지의 실거래 신고명 (apiName 우선) */
export function tradeNameOf(apt: AptComplex): string {
  return apt.apiName ?? apt.name;
}

function matchesComplex(apt: AptComplex, item: { aptNm?: string; jibun?: string; umdNm?: string }): boolean {
  const name = norm(tradeNameOf(apt));
  if (norm(item.aptNm) === name) {
    // 같은 신고명을 쓰는 단지가 여럿이면(예: 엘크루블루오션 4·5·6단지) 지번으로 구분
    const sameName = APT_COMPLEXES.filter((c) => norm(tradeNameOf(c)) === name);
    if (sameName.length > 1 && item.jibun) return jibunOf(apt) === item.jibun;
    return true;
  }
  // 신고명이 달라도 명지동 지번이 같으면 같은 단지
  return !!item.jibun && item.umdNm === "명지동" && jibunOf(apt) === item.jibun;
}

export async function getComplexTrades(apt: AptComplex): Promise<{ trades: RawItem[]; rents: RentRawItem[] }> {
  const [allTrades, allRents] = await Promise.all([
    getTradeCache<RawItem>("apt-trade"),
    getTradeCache<RentRawItem>("apt-rent"),
  ]);
  const trades = (allTrades ?? []).filter(
    (t) => (t as RawItem & { cdealType?: string }).cdealType !== "O" && matchesComplex(apt, t)
  );
  // 전월세 자료에는 지번이 없어 신고명으로만 매칭
  const names = new Set([norm(tradeNameOf(apt)), ...trades.map((t) => norm(t.aptNm))]);
  const sharedName = APT_COMPLEXES.filter((c) => norm(tradeNameOf(c)) === norm(tradeNameOf(apt))).length > 1;
  const rents = sharedName ? [] : (allRents ?? []).filter((r) => names.has(norm(r.aptNm)));
  return { trades, rents };
}
