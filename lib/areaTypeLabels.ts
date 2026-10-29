import fs from "fs";
import path from "path";

// apt_mapping.txt에서 단지별 "전용면적 → 평형 타입 이름(34A, 39B …)"을 읽는다 (서버 전용)
// 한 면적에 타입이 여러 개면 모두 돌려준다 (예: 84.97 → ["34B", "34C"])
export type AreaTypeLabels = Record<string, string[]>;

let cache: Record<string, AreaTypeLabels> | null = null;

function load(): Record<string, AreaTypeLabels> {
  if (cache) return cache;
  const content = fs.readFileSync(path.join(process.cwd(), "apt_mapping.txt"), "utf-8");
  const result: Record<string, AreaTypeLabels> = {};
  let current = "";
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      current = line.slice(1).trim();
      result[current] ??= {};
      continue;
    }
    if (!current) continue;
    const area = line.match(/^([\d.]+)/)?.[1];
    const label = line.match(/"([^"]+)"/)?.[1];
    if (!area || !label) continue;
    const key = String(parseFloat(area));
    const list = (result[current][key] ??= []);
    if (!list.includes(label)) list.push(label);
  }
  cache = result;
  return result;
}

const norm = (s: string) => s.replace(/[\s·\-]/g, "");

/** 실거래 신고명(aptNm)으로 해당 단지의 면적별 타입 이름. 여러 이름을 주면 처음 찾은 것을 쓴다 (공백 차이 무시) */
export function getAreaTypeLabels(...tradeNames: string[]): AreaTypeLabels {
  const all = load();
  for (const name of tradeNames) {
    if (all[name]) return all[name];
    const key = Object.keys(all).find((k) => norm(k) === norm(name));
    if (key) return all[key];
  }
  return {};
}
