// 명지 아파트 월간 실거래가 글. node scripts/monthly-trade-post.mjs <데이터폴더> 2026 10 "11월 18일"
// → <데이터폴더>/post_month_2026_10.json, 저장은 scripts/save-blog-draft.mjs
import fs from "fs";
const [SP, Ys, Ms, cutoff] = process.argv.slice(2);
const Y = +Ys, M = +Ms, PM = M === 1 ? 12 : M - 1;
const data = JSON.parse(fs.readFileSync(`${SP}/month_${Y}_${M}.json`, "utf8"));
const REGION = { ocean: "명지오션시티", kukje: "명지국제신도시", ecodelta: "에코델타시티" };
const price = (man) => { const e = Math.floor(man / 10000), r = man % 10000; return ((e ? `${e}억` : "") + (r ? ` ${r.toLocaleString("ko-KR")}만` : "")).trim(); };
const deal = (d) => `<span style="white-space:nowrap">${price(d.amt)}</span><br><span style="font-size:12px;color:#6b7280;white-space:nowrap">${d.fl}층${d.dir ? "·직거래" : ""}</span>`;
const typesOf = (c, ar) => c.types[String(parseFloat(ar))] ?? "";
const nameCell = (c) => (c.trade ? `<a href="/real-estate/${c.vr}">${c.name}</a>` : c.name);
const blog = (slug, text) => `<a href="/blog/${encodeURIComponent(slug)}">${text}</a>`;
const quantile = (s, q) => { const p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return Math.round(s[lo] + (s[hi] - s[lo]) * (p - lo)); };

const rows = (region) => {
  const list = data.filter((c) => c.region === region && c.deals.length).sort((a, b) => b.deals.length - a.deals.length);
  const out = [];
  for (const c of list) {
    const g = {};
    for (const d of c.deals) (g[d.ar] ??= []).push(d);
    const areas = Object.keys(g).sort((a, b) => parseFloat(a) - parseFloat(b));
    areas.forEach((ar, i) => {
      const s = [...g[ar]].sort((a, b) => b.amt - a.amt);
      const cell = i === 0 ? `<td${areas.length > 1 ? ` rowspan="${areas.length}" style="vertical-align:middle"` : ""}>${nameCell(c)}<br><strong>${c.deals.length}건</strong></td>` : "";
      out.push(`  <tr>${cell}<td style="white-space:nowrap">${ar}㎡<br><span style="font-size:12px;color:#6b7280">${typesOf(c, ar) ? `${typesOf(c, ar)} · ` : ""}${s.length}건</span></td><td>${deal(s[0])}</td><td>${s.length > 1 ? deal(s[s.length - 1]) : "-"}</td></tr>`);
    });
  }
  return { list, html: `<table>\n  <tr><th>단지 (${M}월 거래량)</th><th>전용 (거래)</th><th>최고가</th><th>최저가</th></tr>\n${out.join("\n")}\n</table>` };
};

const kukje = rows("kukje"), ocean = rows("ocean"), eco = rows("ecodelta");
const main = data.filter((c) => c.region !== "ecodelta");
const total = main.reduce((s, c) => s + c.deals.length, 0);
const prevTotal = main.reduce((s, c) => s + c.prevCount, 0);
const sumR = (r, k) => data.filter((c) => c.region === r).reduce((s, c) => s + (k ? c.prevCount : c.deals.length), 0);
const top = [...main].filter((c) => c.deals.length).sort((a, b) => b.deals.length - a.deals.length);
const topN = top.filter((c) => c.deals.length >= top[Math.min(4, top.length - 1)].deals.length);
const allDeals = main.flatMap((c) => c.deals.map((d) => ({ ...d, c })));
const d84 = allDeals.filter((d) => Math.floor(parseFloat(d.ar)) === 84);
const top84 = [...d84].sort((a, b) => b.amt - a.amt)[0];
const med84 = quantile(d84.map((d) => d.amt).sort((a, b) => a - b), 0.5);
const d59 = allDeals.filter((d) => Math.floor(parseFloat(d.ar)) === 59);
const med59 = d59.length ? quantile(d59.map((d) => d.amt).sort((a, b) => a - b), 0.5) : 0;
const maxAll = [...allDeals].sort((a, b) => b.amt - a.amt)[0];
const direct = allDeals.filter((d) => d.dir).length;
const chg = Math.round(((total - prevTotal) / prevTotal) * 100);
const hasAmb = data.some((c) => c.id === "blueocean_amb" && c.deals.length);

const post = {
  slug: `명지-아파트-실거래가-${Y}년-${M}월`,
  title: `명지 아파트 실거래가 ${Y}년 ${M}월｜단지별 거래량·면적별 최고가·최저가 정리`,
  description: `${Y}년 ${M}월 한 달 명지국제신도시·명지오션시티 아파트 매매 실거래 ${total}건을 단지별 거래량과 전용면적별 최고가·최저가로 정리했습니다. ${PM}월보다 ${chg >= 0 ? `${chg}% 늘었습니다` : `${-chg}% 줄었습니다`}. 국토교통부 실거래가 기준.`,
  content: `<p><strong>${Y}년 ${M}월 한 달 동안 명지국제신도시와 명지오션시티 아파트는 모두 ${total}건 매매 거래</strong>되었습니다. ${PM}월(${prevTotal}건)보다 <strong>${Math.abs(chg)}% ${chg >= 0 ? "늘었고" : "줄었고"}</strong>, 가장 많이 거래된 단지는 ${topN.map((c) => `<strong>${c.name}(${c.deals.length}건)</strong>`).slice(0, 4).join(", ")}입니다. 전용 84㎡대 최고가는 <strong>${top84.c.name} 전용 ${top84.ar}㎡ ${price(top84.amt)} 원(${top84.fl}층)</strong>이었습니다. 국토교통부 실거래가 자료로 단지별 거래량과 같은 전용면적끼리의 최고가·최저가를 정리했습니다.</p>

<h2>${M}월 명지 아파트 거래량 한눈에 보기</h2>

<table>
  <tr><th>구분</th><th>${M}월 거래량</th><th>${PM}월</th></tr>
  <tr><td>명지국제신도시</td><td>${sumR("kukje")}건 (${kukje.list.length}개 단지)</td><td>${sumR("kukje", 1)}건</td></tr>
  <tr><td>명지오션시티</td><td>${sumR("ocean")}건 (${ocean.list.length}개 단지)</td><td>${sumR("ocean", 1)}건</td></tr>
  <tr><td><strong>합계</strong></td><td><strong>${total}건</strong></td><td>${prevTotal}건</td></tr>
</table>

<p>${small(`${PM}월 거래량은 지금까지 추가 신고된 거래를 반영한 숫자라 지난달 글(${PM}월 글 작성 당시)보다 많을 수 있습니다.`)}</p>

<h3>거래량 상위 단지</h3>
<ol>
${top.slice(0, 6).map((c) => `  <li>${nameCell(c)} – ${c.deals.length}건 (${REGION[c.region]})</li>`).join("\n")}
</ol>

<h3>${M}월 한눈에 보는 가격</h3>
<ul>
  <li>전용 84㎡대 거래 ${d84.length}건의 중앙값은 <strong>${price(med84)} 원</strong>입니다.</li>
  ${d59.length ? `<li>전용 59㎡대 거래 ${d59.length}건의 중앙값은 <strong>${price(med59)} 원</strong>입니다.</li>` : ""}
  <li>${M}월 최고 거래가는 ${maxAll.c.name} 전용 ${maxAll.ar}㎡ ${price(maxAll.amt)} 원(${maxAll.fl}층)입니다.</li>
  <li>직거래는 ${direct}건으로, 시세와 다르게 신고되는 경우가 있어 표에 "직거래"로 표시했습니다.</li>
</ul>

<h2>명지국제신도시 단지별 실거래가</h2>

<p>같은 단지라도 전용면적이 다르면 가격을 비교할 수 없어서, <strong>같은 전용면적끼리 묶어</strong> 최고가와 최저가를 정리했습니다. 가격 아래 작은 글씨는 거래 층수입니다. 단지 이름을 누르면 면적별 가격 판단 기준과 가격 추이를 볼 수 있습니다.</p>

${kukje.html}

<h2>명지오션시티 단지별 실거래가</h2>

${ocean.html}

${eco.list.length ? `<h2>참고: 에코델타시티</h2>\n\n<p>에코델타시티는 신축 단지가 많아 아직 아파트 매매 거래가 적고, 분양권 거래가 중심입니다. ${M}월 아파트 매매 거래는 다음과 같습니다. 분양권 시세는 ${blog("에코델타시티-분양권-실거래가", "에코델타시티 분양권 실거래가")}를 참고하세요.</p>\n\n${eco.html}` : ""}

<h2>실거래가 볼 때 알아둘 점</h2>

<ul>
  <li><strong>층과 동에 따라 가격 차이가 큽니다.</strong> 같은 단지·같은 면적이라도 저층과 고층, 조망이 좋은 동과 아닌 동은 수천만 원씩 차이가 납니다.</li>
  <li><strong>직거래는 시세와 다를 수 있습니다.</strong> 가족 간 거래 등 중개사를 거치지 않은 거래는 일반 시세보다 낮게 신고되는 경우가 있습니다.</li>
  <li><strong>면적은 전용면적 기준입니다.</strong> 전용 84㎡는 흔히 33~35평형, 59㎡는 24~25평형입니다(${blog("전용면적-공급면적-차이-평수-계산법", "전용면적과 평수 계산법")} 참고).</li>
  <li><strong>계약 해제된 거래는 뺐습니다.</strong></li>
  ${hasAmb ? `<li><strong>엘크루블루오션</strong>은 4·5·6단지가 같은 이름·지번으로 신고되어, 동 정보가 있는 거래만 단지별로 나누고 동 정보가 없는 거래는 "구분 불가"로 따로 표시했습니다.</li>` : `<li><strong>엘크루블루오션</strong> 4·5·6단지는 같은 이름·지번으로 신고되어 동 번호로 단지를 구분했습니다.</li>`}
</ul>

<p>단지별 3.3㎡당 가격 순위는 <a href="/real-estate/kukje">명지국제신도시 시세 비교</a>·<a href="/real-estate/ocean">명지오션시티 시세 비교</a>에서, 집 살 때 드는 세금과 수수료는 <a href="/tools">부동산 계산기</a>에서 확인할 수 있습니다. 지난달 정리는 ${blog(`명지-아파트-실거래가-${Y}년-${PM}월`, `명지 아파트 실거래가 ${Y}년 ${PM}월`)}에 있습니다.</p>

<p style="font-size:13px;color:#6b7280">※ 국토교통부 아파트 매매 실거래가 공개 자료를 바탕으로, ${Y}년 ${M}월 계약 거래 중 ${cutoff}까지 신고된 거래를 정리했습니다. 실거래 신고는 계약 후 30일 이내에 이뤄지므로 ${M}월 거래는 이후 추가될 수 있습니다. 금액은 만 원 단위입니다.</p>`,
};
function small(t) { return `<span style="font-size:12px;color:#6b7280">${t}</span>`; }

fs.writeFileSync(`${SP}/post_month_${Y}_${M}.json`, JSON.stringify(post, null, 2));
const style = `<style>body{font-family:system-ui;max-width:760px;margin:24px auto;padding:0 16px;line-height:1.8}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #ddd;padding:6px;vertical-align:top}</style>`;
fs.writeFileSync(`${SP}/post_month_${Y}_${M}-preview.html`, `<!doctype html><meta charset="utf-8">${style}<p style="color:#888">/blog/${post.slug}<br>${post.description}</p><h1>${post.title}</h1>${post.content}`);
console.log(total, "건 (", PM, "월", prevTotal, chg + "%) |", post.content.replace(/<[^>]+>/g, "").length, "자 | 84최고", top84.c.name, top84.ar, top84.amt, "| 84중앙", med84, "| 59중앙", med59, "| 최고", maxAll.c.name, maxAll.amt, "| 직거래", direct, "| amb", hasAmb);
