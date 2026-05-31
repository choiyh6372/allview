import { NextResponse } from "next/server";
import { JEONGBI_PROJECTS, type JeongbiProject } from "@/lib/jeongbiData";
import { JEONGBI_ADDRESS_OVERRIDES } from "@/lib/jeongbiAddressOverrides";

export const revalidate = 86400;

const API_URL = "https://apis.data.go.kr/6260000/MaintenanceBusinessStatus1/getMaintenanceBusiness1";
const CACHE_TTL = 86400;

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

// areaName 예: "금사1 재개발", "낙민1 재건축", "낙민1 가로주택정비"
function extractType(areaName: string): JeongbiProject["type"] {
  if (areaName.includes("재건축") || areaName.includes("소규모재건축")) return "재건축";
  if (areaName.includes("도시환경")) return "도시환경정비";
  if (areaName.includes("주거환경") || areaName.includes("가로주택")) return "주거환경개선";
  return "재개발";
}

function extractName(areaName: string): string {
  return areaName
    .replace(/\s*(재개발|재건축|도시환경정비|주거환경개선|가로주택정비|소규모재건축)\s*$/, "")
    .trim() || areaName;
}

// step 예: "추진위원회 구성", "건축심의 및 통합심의", "착공" 등
function mapStatus(step: string): JeongbiProject["status"] {
  const v = (step ?? "").replace(/\s/g, "");
  if (v.includes("해제")) return "해제";
  if (v.includes("준공") || v.includes("이전고시") || v.includes("청산")) return "준공";
  if (v.includes("착공") || v.includes("공사중") || v.includes("공사")) return "착공";
  if (v.includes("관리처분")) return "관리처분";
  if (v.includes("사업시행") || v.includes("건축심의")) return "사업시행";
  if (v.includes("조합설립")) return "조합설립";
  return "추진위";
}

// location 예: "금정구 금사동 26-1번지" → gu: "금정구", address: "부산광역시 금정구 금사동 26-1번지"
// 구 이름 없는 동 주소를 위한 동→구 매핑
const DONG_TO_GU: Record<string, string> = {
  "당리동":  "사하구",
  "덕천동":  "북구",
  "동삼동":  "영도구",
  "동삼1동": "영도구",
  "명장동":  "동래구",
  "범천동":  "부산진구",
  "초읍동":  "부산진구",
  "영주동":  "중구",
  "온천동":  "동래구",
  "청학동":  "영도구",
  "하단동":  "사하구",
  "양정동":  "부산진구",
  "부암동":  "부산진구",
  "범전동":  "부산진구",
  "낙민동":  "동래구",
};

function parseLocation(location: string): { gu: string; address: string } {
  const trimmed = (location ?? "").trim()
    .replace(/\s*(일원|일대|외)\s*$/, "")
    .trim();
  if (!trimmed || trimmed === "-") return { gu: "", address: "" };

  // 구/군으로 시작하면 그대로 사용
  const guMatch = trimmed.match(/^(\S+[구군])/);
  if (guMatch) {
    return { gu: guMatch[1], address: `부산광역시 ${trimmed}` };
  }

  // 동으로 시작하면 매핑 테이블에서 구 찾기
  const dongMatch = trimmed.match(/^(\S+[동읍면리])/);
  const gu = dongMatch ? (DONG_TO_GU[dongMatch[1]] ?? "") : "";
  const address = gu
    ? `부산광역시 ${gu} ${trimmed}`
    : `부산광역시 ${trimmed}`;
  return { gu, address };
}

async function fetchFromApi(apiKey: string): Promise<JeongbiProject[]> {
  const url = new URL(API_URL);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1000");

  const res = await fetch(url.toString(), { next: { revalidate: CACHE_TTL } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();

  if (
    xml.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR") ||
    xml.includes("<resultCode>E</resultCode>") ||
    xml.includes("INVALID_REQUEST_PARAMETER_ERROR")
  ) {
    throw new Error("API key error");
  }

  const raw = parseXmlItems(xml);
  if (raw.length === 0) throw new Error("No items");

  return raw
    .filter((item) => item.areaName)
    .map((item, i): JeongbiProject | null => {
      const areaName = item.areaName ?? "";
      const name = extractName(areaName);
      const type = extractType(areaName);
      const status = mapStatus(item.step ?? "");
      const aCode = item.aCode ?? "";
      const overrideAddr = JEONGBI_ADDRESS_OVERRIDES[aCode];
      // 오버라이드가 빈 문자열("")이면 이 항목은 표시하지 않음
      if (overrideAddr === "") return null;
      const rawLocation = overrideAddr !== undefined ? overrideAddr : (item.location ?? "");
      const { gu, address } = parseLocation(rawLocation);
      const totalHo = item.generationJoo
        ? parseInt(item.generationJoo.replace(/,/g, ""), 10) || undefined
        : undefined;
      const contractor = (item.contractor ?? "").includes("미") ? undefined : item.contractor;
      const telNo = (item.telNo ?? "") || undefined;

      return {
        id: item.aCode || `api_${i}`,
        name,
        type,
        status,
        gu,
        address,
        totalHo,
        ...(contractor ? { contractor } : {}),
        ...(telNo ? { telNo } : {}),
      };
    })
    .filter((item): item is JeongbiProject => item !== null);
}

export async function GET() {
  const apiKey = process.env.MOLIT_API_KEY;

  if (apiKey) {
    try {
      const items = await fetchFromApi(apiKey);
      return NextResponse.json(
        { items, source: "api" },
        { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
      );
    } catch (err) {
      console.warn("[jeongbi] API 실패, 정적 데이터로 대체:", err);
    }
  }

  return NextResponse.json(
    { items: JEONGBI_PROJECTS, source: "static" },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
