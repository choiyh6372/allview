import { getTradeCache } from "@/lib/tradeCache";
import { APT_COMPLEXES, type AptComplex } from "@/lib/mapData";
import { complexData } from "@/lib/vrData";
import type { RawItem, RentRawItem } from "@/lib/molitApi";

// 단지별 실거래가 페이지용: R2 실거래 캐시에서 특정 단지의 매매·분양권·전월세 거래를 골라낸다

/** VR투어와 지도에 함께 등록된 모든 단지의 실거래가 페이지를 제공한다. */
const MAPPED_COMPLEX_IDS = new Set(APT_COMPLEXES.map((complex) => complex.id));
export const TRADE_PAGE_COMPLEXES = complexData
  .filter((complex) => MAPPED_COMPLEX_IDS.has(complex.id))
  .map((complex) => complex.id);

/** 매매·분양권·전월세를 합쳐 이보다 적으면 검색 제외(noindex)·사이트맵 제외 */
export const MIN_RECORDS_FOR_INDEX = 3;

const norm = (s?: string) => (s ?? "").replace(/[\s·\-]/g, "");
const jibunOf = (apt: AptComplex) => apt.legalAddress?.match(/명지동 ([0-9-]+)$/)?.[1];
/** "엘크루블루오션 4단지" → "4" (실거래 신고의 동 번호 앞자리와 맞춰 단지 구분) */
const danjiNoOf = (apt: AptComplex) => apt.name.match(/(\d+)\s*단지/)?.[1];

/** 이 단지의 실거래 신고명 (apiName 우선) */
export function tradeNameOf(apt: AptComplex): string {
  return apt.apiName ?? apt.name;
}

type Match = "yes" | "no" | "ambiguous";

function matchTrade(apt: AptComplex, item: RawItem): Match {
  const name = norm(tradeNameOf(apt));
  if (norm(item.aptNm) === name) {
    const sameName = APT_COMPLEXES.filter((c) => norm(tradeNameOf(c)) === name);
    if (sameName.length === 1) return "yes";
    // 같은 신고명을 쓰는 단지가 여럿 (예: 엘크루블루오션 4·5·6단지)
    const danjiNo = danjiNoOf(apt);
    if (danjiNo && sameName.every((c) => danjiNoOf(c))) {
      // 신고 지번이 한 곳으로 몰려 있어 지번으로는 구분이 안 됨 → 동 번호 앞자리로 구분
      const dong = item.aptDong?.trim();
      if (!dong) return "ambiguous";
      return dong.startsWith(danjiNo) ? "yes" : "no";
    }
    return item.jibun && jibunOf(apt) === item.jibun ? "yes" : "no";
  }
  // 신고명이 달라도 명지동 지번이 같으면 같은 단지
  return item.jibun && item.umdNm === "명지동" && jibunOf(apt) === item.jibun ? "yes" : "no";
}

/** 분양권은 지번 없이 신고명(apiName·silvApiNames)으로 매칭 */
function matchesSilv(apt: AptComplex, item: RawItem): boolean {
  const names = new Set([tradeNameOf(apt), ...(apt.silvApiNames ?? [])].map(norm));
  return names.has(norm(item.aptNm));
}

export interface ComplexTradeData {
  trades: RawItem[];
  /** 분양권·입주권 전매 거래 */
  silvs: RawItem[];
  rents: RentRawItem[];
  /** 신고명이 같은 단지끼리 동 정보가 없어 어느 단지인지 알 수 없어 제외한 매매 건수 */
  ambiguousCount: number;
}

interface Caches {
  trades: RawItem[];
  silvs: RawItem[];
  rents: RentRawItem[];
}

async function loadCaches(): Promise<Caches> {
  const [trades, silvs, rents] = await Promise.all([
    getTradeCache<RawItem>("apt-trade"),
    getTradeCache<RawItem>("silv-trade"),
    getTradeCache<RentRawItem>("apt-rent"),
  ]);
  return { trades: trades ?? [], silvs: silvs ?? [], rents: rents ?? [] };
}

function collect(apt: AptComplex, caches: Caches): ComplexTradeData {
  const trades: RawItem[] = [];
  let ambiguousCount = 0;
  for (const t of caches.trades) {
    if (t.cdealType === "O") continue;
    const m = matchTrade(apt, t);
    if (m === "yes") trades.push(t);
    else if (m === "ambiguous") ambiguousCount++;
  }
  const silvs = caches.silvs.filter((s) => s.cdealType !== "O" && matchesSilv(apt, s));
  // 전월세 자료에는 지번·동이 없어 신고명으로만 매칭. 신고명이 겹치는 단지는 구분할 수 없어 표시하지 않음
  const sharedName = APT_COMPLEXES.filter((c) => norm(tradeNameOf(c)) === norm(tradeNameOf(apt))).length > 1;
  const names = new Set([norm(tradeNameOf(apt)), ...trades.map((t) => norm(t.aptNm))]);
  const rents = sharedName ? [] : caches.rents.filter((r) => names.has(norm(r.aptNm)));
  return { trades, silvs, rents, ambiguousCount };
}

export async function getComplexTrades(apt: AptComplex): Promise<ComplexTradeData> {
  return collect(apt, await loadCaches());
}

export function recordCount(d: Pick<ComplexTradeData, "trades" | "silvs" | "rents">): number {
  return d.trades.length + d.silvs.length + d.rents.length;
}

/** 사이트맵용: 단지별 거래 기록 수 (캐시를 한 번만 읽음) */
export async function getTradeRecordCounts(): Promise<Record<string, number>> {
  const caches = await loadCaches();
  const result: Record<string, number> = {};
  for (const id of TRADE_PAGE_COMPLEXES) {
    const apt = APT_COMPLEXES.find((a) => a.id === id);
    if (apt) result[id] = recordCount(collect(apt, caches));
  }
  return result;
}
