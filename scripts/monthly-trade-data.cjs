// 월간 실거래가 글 데이터: node scripts/monthly-trade-data.cjs 2026 10 <출력폴더> → month_2026_10.json
const fs = require("fs");
for (const line of fs.readFileSync(require("path").join(__dirname, "../.env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const jiti = require(require("path").join(__dirname, "../node_modules/jiti"))(__filename, { alias: { "@": require("path").join(__dirname, "..") } });
const { APT_COMPLEXES } = jiti("@/lib/mapData.ts");
const { complexData, getComplexFullName } = jiti("@/lib/vrData.ts");
const { getManyComplexTrades, tradeNameOf } = jiti("@/lib/complexTrades.ts");
const { getAreaTypeLabels } = jiti("@/lib/areaTypeLabels.ts");
const { getTradeCache } = jiti("@/lib/tradeCache.ts");
const [Y, M] = process.argv.slice(2, 4).map(Number);
const OUT = process.argv[4] ?? ".";
const inMonth = (t, y, m) => +t.dealYear === y && +t.dealMonth === m;
(async () => {
  const apts = APT_COMPLEXES.filter((a) => ["ocean", "kukje", "ecodelta"].includes(a.region));
  const all = await getManyComplexTrades(apts);
  const prev = M === 1 ? [Y - 1, 12] : [Y, M - 1];
  const out = [];
  for (const a of apts) {
    const vr = complexData.find((v) => v.id === a.id);
    const deals = all[a.id].trades.filter((t) => inMonth(t, Y, M)).map((t) => ({
      ar: (t.excluUseAr ?? "").trim(), amt: parseInt(t.dealAmount.replace(/,/g, ""), 10), fl: t.floor, dir: t.dealingGbn === "직거래", d: +t.dealDay, dong: t.aptDong ?? "",
    }));
    const prevCount = all[a.id].trades.filter((t) => inMonth(t, prev[0], prev[1])).length;
    if (!deals.length && !prevCount) continue;
    const labels = getAreaTypeLabels(tradeNameOf(a), ...(a.silvApiNames ?? []));
    out.push({
      id: a.id, region: a.region, name: vr ? getComplexFullName(vr) : a.name,
      vr: vr ? `${vr.regionId}/${vr.slug}` : null, trade: !!vr,
      types: Object.fromEntries(Object.entries(labels).map(([k, v]) => [k, v.join("·")])),
      deals, prevCount,
    });
  }
  // 블루오션 4·5·6단지: 동 정보 없는 거래 (단지 구분 불가)
  const raw = (await getTradeCache("apt-trade")) ?? [];
  const amb = raw.filter((t) => t.cdealType !== "O" && t.aptNm.replace(/\s/g, "") === "엘크루블루오션" && !(t.aptDong ?? "").trim());
  const ambDeals = amb.filter((t) => inMonth(t, Y, M)).map((t) => ({ ar: t.excluUseAr.trim(), amt: parseInt(t.dealAmount.replace(/,/g, ""), 10), fl: t.floor, dir: t.dealingGbn === "직거래", d: +t.dealDay }));
  const ambPrev = amb.filter((t) => inMonth(t, prev[0], prev[1])).length;
  if (ambDeals.length || ambPrev) {
    const labels = getAreaTypeLabels("엘크루블루오션");
    out.push({ id: "blueocean_amb", region: "ocean", name: "엘크루블루오션 (4·5·6단지 구분 불가)", vr: null, trade: false,
      types: Object.fromEntries(Object.entries(labels).map(([k, v]) => [k, v.join("·")])), deals: ambDeals, prevCount: ambPrev });
  }
  fs.writeFileSync(`${OUT}/month_${Y}_${M}.json`, JSON.stringify(out, null, 1));
  const sum = (r, k) => out.filter((c) => c.region === r).reduce((s, c) => s + (k === "prev" ? c.prevCount : c.deals.length), 0);
  for (const r of ["kukje", "ocean", "ecodelta"]) console.log(r, `${M}월`, sum(r), `| ${prev[1]}월`, sum(r, "prev"));
  console.log("top", out.filter((c) => c.region !== "ecodelta").sort((a, b) => b.deals.length - a.deals.length).slice(0, 6).map((c) => c.name + c.deals.length).join(", "));
  const latest = raw.filter((t) => t.cdealType !== "O").map((t) => `${t.dealYear}${String(t.dealMonth).padStart(2, "0")}${String(t.dealDay).padStart(2, "0")}`).sort().pop();
  console.log("latest deal date in cache", latest);
})();
