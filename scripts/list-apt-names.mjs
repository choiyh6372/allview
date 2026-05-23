// 국토부 실거래 API에서 강서구 아파트 단지명 전체 추출
const API_KEY = "39a990dd250e992b303d7a6a3bcc8d9a5b73d019db35d073d5b46ffe59f89518";
const LAWD_CD = "26440";

function parseXml(xml) {
  const names = new Set();
  const re = /<aptNm>([\s\S]*?)<\/aptNm>/g;
  let m;
  while ((m = re.exec(xml)) !== null) names.add(m[1].trim());
  return names;
}

async function fetchMonth(dealYmd) {
  const url = new URL("https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade");
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("LAWD_CD", LAWD_CD);
  url.searchParams.set("DEAL_YMD", dealYmd);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1000");
  const res = await fetch(url.toString());
  return parseXml(await res.text());
}

// 최근 12개월만 (충분히 모든 단지 커버)
const months = [];
const now = new Date();
for (let i = 0; i < 12; i++) {
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
  months.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`);
}

const allNames = new Set();
for (const ym of months) {
  const names = await fetchMonth(ym);
  names.forEach(n => allNames.add(n));
  process.stdout.write(`${ym}: ${names.size}개\n`);
}

console.log("\n=== 강서구 아파트 단지명 전체 ===");
const sorted = [...allNames].sort((a, b) => a.localeCompare(b, "ko"));
sorted.forEach(n => console.log(n));
console.log(`\n총 ${sorted.length}개`);
