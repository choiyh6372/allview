import * as XLSX from "xlsx";

// KB부동산 주간/월간 시계열 엑셀 파서 (scripts/parse-kb-weekly.py TS 포팅)

export interface SeriesPoint {
  date: string;
  value: number;
}
export interface RegionEntry {
  code: string;
  name: string;
  latest: number | null;
  series: SeriesPoint[];
}
export interface RegionSet {
  updatedAt: string;
  nationwide: { latest: number | null; series: SeriesPoint[] };
  regions: RegionEntry[];
}
export interface SggResult {
  updatedAt: string;
  regions: RegionEntry[];
}

const CODE_TO_KB_NAME: Record<string, string> = {
  "11": "서울특별시", "21": "부산광역시", "22": "대구광역시", "23": "인천광역시",
  "24": "(구)광주광역시", "25": "대전광역시", "26": "울산광역시", "29": "세종특별자치시",
  "31": "경기도", "32": "강원특별자치도", "33": "충청북도", "34": "충청남도",
  "35": "전북특별자치도", "36": "(구)전라남도", "37": "경상북도", "38": "경상남도",
  "39": "제주특별자치도",
};
const CODE_TO_KB_NAME_MONTHLY: Record<string, string> = {
  ...CODE_TO_KB_NAME,
  "24": "광주광역시", "35": "전라북도", "36": "전라남도",
};
const CODE_TO_DISPLAY_NAME: Record<string, string> = {
  "11": "서울", "21": "부산", "22": "대구", "23": "인천", "24": "광주",
  "25": "대전", "26": "울산", "29": "세종", "31": "경기", "32": "강원",
  "33": "충북", "34": "충남", "35": "전북", "36": "전남", "37": "경북",
  "38": "경남", "39": "제주",
};
const SKIP_HEADERS = new Set([
  "강북14개구", "강남11개구", "6개광역시", "5개광역시", "수도권", "기타지방",
  "전남", "광주", "통합", "특별시",
]);

type Row = (string | number | Date | null)[];

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

// xlsx의 cellDates 변환은 로컬 타임존 생성자(new Date(y,m,d))를 쓰므로,
// 서버 타임존과 무관하게 의도한 날짜를 복원하려면 로컬 getter를 써야 함 (UTC/toISOString 쓰면 안 됨).
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function findCol(header: Row, target: string): number {
  let idx = header.findIndex((h) => h === target);
  if (idx !== -1) return idx;
  idx = header.findIndex((h) => typeof h === "string" && (h.startsWith(target) || target.startsWith(h)));
  if (idx === -1) throw new Error(`컬럼을 찾을 수 없습니다: ${target}`);
  return idx;
}

function loadSheetRows(ws: XLSX.WorkSheet): { header: Row; dataRows: Row[] } {
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { header: 1, range: 1, defval: null });
  const header = rows[0];
  const dataRows = rows.slice(2).filter((r) => r[0] !== null && r[0] !== undefined);
  return { header, dataRows };
}

const DATE_STR_RE = /^'?\s*(\d{1,2})\s*\.\s*(\d{1,2})$/;

function parseMonthlyDates(rawCol: (string | number | Date | null)[]): (string | null)[] {
  const dates: (string | null)[] = [];
  let year: number | null = null;
  let month: number | null = null;
  for (const raw of rawCol) {
    if (raw === null || raw === undefined) {
      dates.push(null);
      continue;
    }
    if (typeof raw === "string") {
      const m = DATE_STR_RE.exec(raw.trim());
      if (!m) {
        dates.push(null);
        continue;
      }
      const yy = parseInt(m[1], 10);
      year = yy >= 50 ? 1900 + yy : 2000 + yy;
      month = parseInt(m[2], 10);
    } else if (typeof raw === "number" && raw >= 100) {
      year = Math.trunc(raw);
      month = 1;
    } else if (typeof raw === "number" && year !== null) {
      month = Math.trunc(raw);
    } else {
      dates.push(null);
      continue;
    }
    dates.push(`${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`);
  }
  return dates;
}

function loadMonthlySheetRows(ws: XLSX.WorkSheet): { header: Row; dataRows: Row[] } {
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { header: 1, range: 1, defval: null });
  const header = rows[0];
  const body = rows.slice(2);
  const dates = parseMonthlyDates(body.map((r) => r[0] as string | number | Date | null));
  const dataRows: Row[] = [];
  body.forEach((r, i) => {
    if (dates[i] !== null) dataRows.push([dates[i], ...r.slice(1)]);
  });
  return { header, dataRows };
}

function seriesFor(dataRows: Row[], idx: number, n: number, monthly: boolean): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (const r of dataRows.slice(-n)) {
    const date = r[0];
    const val = r[idx];
    if (monthly) {
      if (typeof val !== "number") continue;
      out.push({ date: date as string, value: round3(val) });
    } else {
      if (date instanceof Date && typeof val === "number") {
        out.push({ date: formatLocalDate(date), value: round3(val) });
      }
    }
  }
  return out;
}

function extractSido(
  header: Row,
  dataRows: Row[],
  n: number,
  monthly: boolean,
  nameMap: Record<string, string> = CODE_TO_KB_NAME
): RegionSet {
  const colIdx: Record<string, number> = {};
  for (const name of [...Object.values(nameMap), "전국"]) colIdx[name] = findCol(header, name);

  const latestRow = dataRows[dataRows.length - 1];
  const latestDateRaw = latestRow[0];
  const latestDate = monthly ? (latestDateRaw as string) : formatLocalDate(latestDateRaw as Date);

  const nationwideRaw = latestRow[colIdx["전국"]];
  const nationwideLatest = typeof nationwideRaw === "number" ? round3(nationwideRaw) : null;
  const nationwideSeries = seriesFor(dataRows, colIdx["전국"], n, monthly);

  const regions: RegionEntry[] = [];
  for (const [code, kbName] of Object.entries(nameMap)) {
    const idx = colIdx[kbName];
    const latestVal = latestRow[idx];
    regions.push({
      code,
      name: CODE_TO_DISPLAY_NAME[code],
      latest: typeof latestVal === "number" ? round3(latestVal) : null,
      series: seriesFor(dataRows, idx, n, monthly),
    });
  }

  return {
    updatedAt: latestDate,
    nationwide: { latest: nationwideLatest, series: nationwideSeries },
    regions,
  };
}

interface Leaf {
  provinceCode: string;
  name: string;
  idx: number;
}

function buildHierarchy(header: Row, nameMap: Record<string, string> = CODE_TO_KB_NAME): Leaf[] {
  const kbNameToCode: Record<string, string> = {};
  for (const [code, name] of Object.entries(nameMap)) kbNameToCode[name] = code;

  const leaves: Leaf[] = [];
  let currentProvince: string | null = null;
  let currentCity: { name: string; idx: number } | null = null;
  const cityHasChild = new Set<number>();

  header.forEach((raw, i) => {
    if (typeof raw !== "string" || !raw) return;
    const name = raw;
    if (name === "구분" || name === "전국") return;
    if (SKIP_HEADERS.has(name)) return;

    if (kbNameToCode[name]) {
      currentProvince = kbNameToCode[name];
      currentCity = { name, idx: i };
      return;
    }
    if (currentProvince === null) return;

    if (name.endsWith("구") && !/^\d+$/.test(name.slice(0, -1))) {
      const parentName = currentCity ? currentCity.name : nameMap[currentProvince];
      const matched = parentName === nameMap[currentProvince] ? name : parentName + name;
      leaves.push({ provinceCode: currentProvince, name: matched, idx: i });
      if (currentCity) cityHasChild.add(currentCity.idx);
      return;
    }

    if (name.endsWith("군")) {
      leaves.push({ provinceCode: currentProvince, name, idx: i });
      return;
    }

    if (name.endsWith("시")) {
      if (currentCity && currentCity.name !== nameMap[currentProvince] && !cityHasChild.has(currentCity.idx)) {
        leaves.push({ provinceCode: currentProvince, name: currentCity.name, idx: currentCity.idx });
      }
      currentCity = { name, idx: i };
      return;
    }
  });

  if (
    currentCity &&
    currentProvince &&
    (currentCity as { name: string; idx: number }).name !== nameMap[currentProvince] &&
    !cityHasChild.has((currentCity as { name: string; idx: number }).idx)
  ) {
    const cc = currentCity as { name: string; idx: number };
    leaves.push({ provinceCode: currentProvince, name: cc.name, idx: cc.idx });
  }

  return leaves;
}

function extractSigungu(
  header: Row,
  dataRows: Row[],
  geoNamesByPrefix: Record<string, Record<string, string>>,
  n: number,
  monthly: boolean,
  nameMap: Record<string, string> = CODE_TO_KB_NAME
): SggResult {
  const leaves = buildHierarchy(header, nameMap);
  const latestRow = dataRows[dataRows.length - 1];
  const latestDateRaw = latestRow[0];
  const latestDate = monthly ? (latestDateRaw as string) : formatLocalDate(latestDateRaw as Date);

  const regions: RegionEntry[] = [];
  for (const { provinceCode, name, idx } of leaves) {
    const geoCode = geoNamesByPrefix[provinceCode]?.[name];
    const val = latestRow[idx];
    if (!geoCode || typeof val !== "number") continue;
    regions.push({
      code: geoCode,
      name,
      latest: round3(val),
      series: seriesFor(dataRows, idx, n, monthly),
    });
  }

  return { updatedAt: latestDate, regions };
}

export interface GeoFeatureLite {
  properties: { code: string; name: string };
}

export function buildGeoNamesByPrefix(features: GeoFeatureLite[]): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const f of features) {
    const prefix = f.properties.code.slice(0, 2);
    (out[prefix] ??= {})[f.properties.name] = f.properties.code;
  }
  return out;
}

const WEEKS_10Y = 520;
const MONTHS_10Y = 120;

export function parseWeeklyWorkbook(
  buffer: Buffer,
  geoNamesByPrefix: Record<string, Record<string, string>>
) {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  const { header: h1, dataRows: d1 } = loadSheetRows(wb.Sheets["1.매매증감"]);
  const { header: h2, dataRows: d2 } = loadSheetRows(wb.Sheets["2.전세증감"]);
  const weeklySido = { saleChange: extractSido(h1, d1, 12, false), jeonseChange: extractSido(h2, d2, 12, false) };
  const weeklySgg = {
    saleChange: extractSigungu(h1, d1, geoNamesByPrefix, 12, false),
    jeonseChange: extractSigungu(h2, d2, geoNamesByPrefix, 12, false),
  };

  const { header: h3, dataRows: d3 } = loadSheetRows(wb.Sheets["3.매매지수"]);
  const { header: h4, dataRows: d4 } = loadSheetRows(wb.Sheets["4.전세지수"]);
  const indexSido = { saleIndex: extractSido(h3, d3, WEEKS_10Y, false), jeonseIndex: extractSido(h4, d4, WEEKS_10Y, false) };
  const indexSgg = {
    saleIndex: extractSigungu(h3, d3, geoNamesByPrefix, WEEKS_10Y, false),
    jeonseIndex: extractSigungu(h4, d4, geoNamesByPrefix, WEEKS_10Y, false),
  };

  return { weeklySido, weeklySgg, indexSido, indexSgg };
}

export function parseMonthlyWorkbook(
  buffer: Buffer,
  geoNamesByPrefix: Record<string, Record<string, string>>
) {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const { header, dataRows } = loadMonthlySheetRows(wb.Sheets["28.아파트매매전세비"]);

  const ratioSido = { ratio: extractSido(header, dataRows, MONTHS_10Y, true, CODE_TO_KB_NAME_MONTHLY) };
  const ratioSgg = { ratio: extractSigungu(header, dataRows, geoNamesByPrefix, MONTHS_10Y, true, CODE_TO_KB_NAME_MONTHLY) };

  return { ratioSido, ratioSgg };
}
