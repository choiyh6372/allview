/**
 * GeoJSON 폴리곤 중 jeongbiData.ts와 매칭 안 된 구역 목록 생성
 * lib/jeongbiManual.ts에 polyName → jeongbiName 매핑만 채워넣으면 됩니다.
 *
 * 실행: node scripts/gen-jeongbi-manual.mjs
 */

import fs from "fs";

const EXISTING_NAMES = [
  "좌천범일1통합","범일4구역","수정1구역","범천1구역","전포3구역",
  "만덕3구역","화명1구역","신평장림1구역","신평장림2구역","괴정지구",
  "감전지구","거제3구역","연산2구역","아미2구역","대연3구역",
  "명륜3구역","우동1차","좌동 재건축","망미주공","광안리 재건축",
  "용호3차","온천4구역","사직1구역","초읍지구","명지3구역",
];

function normalize(n) {
  return n.replace(/\s|정비구역|재개발|재건축|주거환경개선|주거환경관리|도시환경정비|사업|주택|구역|지구/g, "");
}

function isMatched(polyName) {
  const normPoly = normalize(polyName);
  if (!normPoly) return true;
  return EXISTING_NAMES.some(name => {
    const normExisting = normalize(name);
    return normPoly.includes(normExisting) || normExisting.includes(normPoly);
  });
}

const geojson = JSON.parse(fs.readFileSync("public/jeongbi-busan-wgs84.geojson", "utf-8"));

const unmatched = geojson.features
  .filter(f => {
    const name = f.properties.name?.trim();
    return name && name.length > 2 && !isMatched(name);
  })
  .map(f => f.properties.name.trim().replace(/[\r\n]+/g, " "));

const lines = unmatched.map(name =>
  `  // { polyName: "${name}", jeongbiName: "" },`
);

const output = `/**
 * GeoJSON 폴리곤 이름 → jeongbiData.ts 이름 매핑
 * jeongbiName에 jeongbiData.ts의 name 값 그대로 입력하세요.
 * 주석 해제 후 jeongbiName만 채우면 됩니다.
 */
export const JEONGBI_NAME_MAP: { polyName: string; jeongbiName: string }[] = [
${lines.join("\n")}
];
`;

fs.writeFileSync("lib/jeongbiManual.ts", output, "utf-8");
console.log(`lib/jeongbiManual.ts 생성 완료 — ${unmatched.length}개 항목`);
