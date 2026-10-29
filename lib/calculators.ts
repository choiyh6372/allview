// 부동산 계산기 공통 로직 (금액 단위: 원). 블로그 글과 같은 기준을 쓴다.

export const CALC_BASIS = {
  /** 요율·세율 기준 시점 (화면 안내용) */
  asOf: "2026년 10월",
  /** 한국은행 기준금리 (2026년 10월 22일 동결) */
  baseRate: 3.0,
};

// ── 중개수수료 ─────────────────────────────────────────────────────────

type FeeRow = [min: number, max: number, rate: number, cap: number | null];

/** 주택 매매·교환 (부산광역시 조례, 2022.2.16 시행) */
export const HOUSE_SALE_FEES: FeeRow[] = [
  [0, 5e7, 0.006, 250_000],
  [5e7, 2e8, 0.005, 800_000],
  [2e8, 9e8, 0.004, null],
  [9e8, 12e8, 0.005, null],
  [12e8, 15e8, 0.006, null],
  [15e8, Infinity, 0.007, null],
];

/** 주택 임대차 (부산광역시 조례, 2022.2.16 시행) */
export const HOUSE_RENT_FEES: FeeRow[] = [
  [0, 5e7, 0.005, 200_000],
  [5e7, 1e8, 0.004, 300_000],
  [1e8, 6e8, 0.003, null],
  [6e8, 12e8, 0.004, null],
  [12e8, 15e8, 0.005, null],
  [15e8, Infinity, 0.006, null],
];

export type PropertyKind = "house" | "officetel" | "other";
export type DealKind = "sale" | "jeonse" | "monthly";

export interface BrokerageResult {
  /** 요율 적용 기준 금액 (월세는 환산 금액) */
  base: number;
  rate: number;
  cap: number | null;
  /** 상한 중개수수료 (부가세 제외) */
  fee: number;
  /** 월세 환산에 쓴 배수 (100 또는 70) */
  multiplier?: number;
}

/** 월세 거래금액 환산: 보증금 + 월세×100, 그 값이 5천만 원 미만이면 보증금 + 월세×70 */
export function monthlyBase(deposit: number, monthly: number) {
  const t100 = deposit + monthly * 100;
  return t100 < 5e7 ? { base: deposit + monthly * 70, multiplier: 70 } : { base: t100, multiplier: 100 };
}

export function brokerageFee(kind: PropertyKind, deal: DealKind, amount: number, monthly = 0): BrokerageResult {
  const { base, multiplier } = deal === "monthly" ? monthlyBase(amount, monthly) : { base: amount, multiplier: undefined };
  if (kind === "officetel") {
    // 주거용 오피스텔 (전용 85㎡ 이하, 부엌·화장실 등 주거 설비)
    const rate = deal === "sale" ? 0.005 : 0.004;
    return { base, rate, cap: null, fee: Math.floor(base * rate), multiplier };
  }
  if (kind === "other") {
    return { base, rate: 0.009, cap: null, fee: Math.floor(base * 0.009), multiplier };
  }
  const table = deal === "sale" ? HOUSE_SALE_FEES : HOUSE_RENT_FEES;
  const [, , rate, cap] = table.find(([lo, hi]) => base >= lo && base < hi) ?? table[table.length - 1];
  const raw = Math.floor(base * rate);
  return { base, rate, cap, fee: cap ? Math.min(raw, cap) : raw, multiplier };
}

// ── 취득세 ─────────────────────────────────────────────────────────────

export interface AcquisitionInput {
  price: number;
  /** 전용 85㎡ 초과 */
  over85: boolean;
  /** 새로 사는 집을 포함한 세대 주택 수 */
  houses: 1 | 2 | 3 | 4;
  /** 새 집이 조정대상지역 */
  regulated: boolean;
  /** 일시적 2주택 (기존 집을 기한 안에 처분) */
  temporary: boolean;
  /** 생애최초 감면 */
  firstHome: boolean;
}

export interface AcquisitionResult {
  /** 적용 취득세율 */
  rate: number;
  heavy: boolean;
  tax: number;
  /** 생애최초 감면액 (취득세) */
  relief: number;
  edu: number;
  /** 생애최초 감면에 따라 함께 줄어드는 지방교육세 */
  eduRelief: number;
  farm: number;
  total: number;
  /** 생애최초 요건(12억 이하) 불충족 */
  firstHomeIneligible: boolean;
}

/** 1주택 일반세율: 6억 이하 1%, 9억 초과 3%, 그 사이는 (취득가액(억) × 2/3 − 3)% (소수점 넷째 자리까지) */
export function generalRate(price: number) {
  if (price <= 6e8) return 0.01;
  if (price > 9e8) return 0.03;
  const pct = Math.round(((price / 1e8) * (2 / 3) - 3) * 10000) / 10000;
  return pct / 100;
}

export function acquisitionTax(i: AcquisitionInput): AcquisitionResult {
  let heavyRate = 0;
  if (i.houses === 2 && i.regulated && !i.temporary) heavyRate = 0.08;
  if (i.houses === 3) heavyRate = i.regulated ? 0.12 : 0.08;
  if (i.houses === 4) heavyRate = 0.12;

  const heavy = heavyRate > 0;
  const rate = heavy ? heavyRate : generalRate(i.price);
  const tax = Math.floor(i.price * rate);
  // 지방교육세: 일반세율은 취득세율의 1/10, 중과는 0.4%
  const edu = Math.floor(heavy ? i.price * 0.004 : i.price * rate * 0.1);
  // 농어촌특별세: 85㎡ 초과만 (일반 0.2%, 8% 중과 0.6%, 12% 중과 1.0%)
  const farm = i.over85 ? Math.floor(i.price * (heavyRate === 0.12 ? 0.01 : heavyRate === 0.08 ? 0.006 : 0.002)) : 0;

  const firstHomeIneligible = i.firstHome && (i.price > 12e8 || i.houses > 1);
  const relief = i.firstHome && !firstHomeIneligible ? Math.min(tax, 2_000_000) : 0;
  // 취득세가 감면되면 지방교육세도 같은 비율로 줄어든다 (생애최초는 농특세 비과세 주택에 해당)
  const eduRelief = relief && tax ? Math.floor((edu * relief) / tax) : 0;
  return { rate, heavy, tax, relief, edu, eduRelief, farm, total: tax - relief + edu - eduRelief + farm, firstHomeIneligible };
}

// ── 전월세 전환 ────────────────────────────────────────────────────────

/** 법정 전환율 상한: min(연 10%, 기준금리 + 2%p) */
export function legalConversionRate(baseRate = CALC_BASIS.baseRate) {
  return Math.min(10, baseRate + 2);
}

/** 전세 → 월세: 줄어드는 보증금 × 전환율 ÷ 12 */
export function jeonseToMonthly(jeonse: number, newDeposit: number, ratePct: number) {
  return Math.max(0, Math.round(((jeonse - newDeposit) * (ratePct / 100)) / 12));
}

/** 월세 → 전세: 월세 × 12 ÷ 전환율 만큼 보증금 증가 */
export function monthlyToJeonse(deposit: number, monthly: number, ratePct: number) {
  return Math.round(deposit + (monthly * 12) / (ratePct / 100));
}

/** 실제 적용된 전환율(%): 월세 × 12 ÷ (전세 − 월세 보증금) */
export function impliedRate(jeonse: number, deposit: number, monthly: number) {
  const diff = jeonse - deposit;
  return diff > 0 ? (monthly * 12 * 100) / diff : 0;
}

// ── 표시 ───────────────────────────────────────────────────────────────

/** 1,234,500원 → "123만 4,500원" */
export function wonText(n: number) {
  n = Math.round(n);
  if (n === 0) return "0원";
  const eok = Math.floor(n / 1e8), m = Math.floor((n % 1e8) / 1e4), r = n % 1e4;
  return [eok ? `${eok}억` : "", m ? `${m.toLocaleString("ko-KR")}만` : "", r ? r.toLocaleString("ko-KR") : ""].filter(Boolean).join(" ") + "원";
}

export const pct = (rate: number) => `${+(rate * 100).toFixed(4)}%`;
