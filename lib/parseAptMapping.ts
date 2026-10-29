import fs from "fs";
import path from "path";

export type AreaTypeMap = Record<string, Record<string, string>>;
export type SupplyAreaMap = Record<string, Record<string, number>>;

export function parseAptMapping(): { areaTypeMap: AreaTypeMap; supplyAreaMap: SupplyAreaMap } {
  const filePath = path.join(process.cwd(), "apt_mapping.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  const areaTypeMap: AreaTypeMap = {};
  const supplyAreaMap: SupplyAreaMap = {};
  let currentApt = "";

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#")) {
      currentApt = line.slice(1).trim();
      areaTypeMap[currentApt] = areaTypeMap[currentApt] ?? {};
      supplyAreaMap[currentApt] = supplyAreaMap[currentApt] ?? {};
      continue;
    }

    if (!currentApt) continue;

    // 전용면적 (첫 번째 숫자)
    const areaMatch = line.match(/^([\d.]+)/);
    if (!areaMatch) continue;
    const area = String(parseFloat(areaMatch[1]));

    // 분양면적: 마지막 쉼표 뒤 숫자
    const supplyMatch = line.match(/,\s*(\d+\.?\d*)\s*$/);
    if (supplyMatch) {
      const supply = parseFloat(supplyMatch[1]);
      if (supply > 0) supplyAreaMap[currentApt][area] = supply;
    }

    // 동/타입 letter (areaTypeMap 기존 로직)
    const match = line.match(/^([\d.]+)\s*:\s*([A-Za-z][A-Za-z\d]*)\s*:/);
    if (match) {
      areaTypeMap[currentApt][area] = match[2].toUpperCase();
    }
  }

  return { areaTypeMap, supplyAreaMap };
}

const normName = (n: string) => n.replace(/[\s·\-]/g, "");

/** 매핑 파일의 단지 키 찾기: 신고명 후보를 차례로 비교 (공백·가운뎃점·하이픈 차이 무시) */
export function findMappingKey(map: Record<string, unknown>, names: string[]): string | undefined {
  const keys = Object.keys(map);
  for (const name of names) {
    const key = keys.find((k) => normName(k) === normName(name));
    if (key) return key;
  }
  return undefined;
}
