import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MapPin, TrendingUp } from "lucide-react";
import { complexData, getComplexFullName } from "@/lib/vrData";
import { APT_COMPLEXES } from "@/lib/mapData";
import { buildComplexList } from "@/lib/aptTradeApi";
import { getComplexTrades, MIN_RECORDS_FOR_INDEX, recordCount, TRADE_PAGE_COMPLEXES, tradeNameOf } from "@/lib/complexTrades";
import { getAreaTypeLabels } from "@/lib/areaTypeLabels";
import { buildPriceGuides } from "@/lib/priceGuide";
import { findMappingKey, parseAptMapping } from "@/lib/parseAptMapping";
import { listApprovedReviews } from "@/lib/reviewStore";
import { isReviewEnabled } from "@/lib/reviewUtils";
import ComplexPriceChart from "@/components/real-estate/ComplexPriceChart";
import BackButton from "@/components/common/BackButton";
import ComplexReviews from "@/components/vr/ComplexReviews";
import type { RawItem, RentRawItem } from "@/lib/molitApi";

export const revalidate = 3600;
// 페이지를 켠 단지만 만들고, 그 외 주소는 라우팅 단계에서 404 (soft 404 방지)
export const dynamicParams = false;

export function generateStaticParams() {
  return complexData
    .filter((c) => TRADE_PAGE_COMPLEXES.includes(c.id))
    .map((c) => ({ regionId: c.regionId, slug: c.slug }));
}

type Props = { params: { regionId: string; slug: string } };

function findComplex(regionId: string, slug: string) {
  const vr = complexData.find((c) => c.regionId === regionId && c.slug === slug);
  if (!vr || !TRADE_PAGE_COMPLEXES.includes(vr.id)) return null;
  const apt = APT_COMPLEXES.find((a) => a.id === vr.id);
  return apt ? { vr, apt } : null;
}

const man = (s?: string) => parseInt((s ?? "0").replace(/,/g, ""), 10) || 0;
const price = (v: number) => {
  const eok = Math.floor(v / 10000), rest = v % 10000;
  return `${eok ? `${eok}억` : ""}${rest ? ` ${rest.toLocaleString("ko-KR")}` : ""}${eok && !rest ? "" : "만"}`.trim();
};
const dateOf = (i: { dealYear?: string; dealMonth?: string; dealDay?: string }) =>
  `${i.dealYear}.${String(i.dealMonth).padStart(2, "0")}.${String(i.dealDay).padStart(2, "0")}`;
const sortKey = (i: { dealYear?: string; dealMonth?: string; dealDay?: string }) =>
  `${i.dealYear}${String(i.dealMonth).padStart(2, "0")}${String(i.dealDay).padStart(2, "0")}`;
/** 단지 이름 뒤 보조사 (받침 있으면 "은", 없으면 "는") */
const eunneun = (name: string) => {
  const code = name.trim().charCodeAt(name.trim().length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 ? `${name}은` : `${name}는`;
  return `${name}은(는)`;
};
// 전용면적은 신고된 값 그대로 표시 (소수점 버리지 않음)
const areaOf = (i: { excluUseAr?: string }) => (i.excluUseAr ?? "").trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = findComplex(params.regionId, params.slug);
  if (!found) return {};
  const fullName = getComplexFullName(found.vr);
  const data = await getComplexTrades(found.apt);
  const kinds = [data.trades.length && "매매", data.silvs.length && "분양권", data.rents.length && "전월세"].filter(Boolean).join("·");
  return {
    title: `${fullName} 실거래가 추이·시세 | ${found.vr.regionName} - AllView`,
    description: `${fullName} 아파트 ${kinds || "매매·전월세"} 실거래가 추이와 전용면적별 시세, 최근 거래 내역을 국토교통부 실거래가 자료로 매일 갱신합니다.`,
    alternates: { canonical: `/real-estate/${found.vr.regionId}/${found.vr.slug}` },
    // 거래 기록이 거의 없는 단지는 검색 제외 (빈 페이지 노출 방지)
    ...(recordCount(data) < MIN_RECORDS_FOR_INDEX && { robots: { index: false, follow: true } }),
  };
}

export default async function ComplexTradePage({ params }: Props) {
  const found = findComplex(params.regionId, params.slug);
  if (!found) notFound();
  const { vr, apt } = found;
  const fullName = getComplexFullName(vr);

  const { trades, silvs, rents, ambiguousCount } = await getComplexTrades(apt);
  const typeLabels = getAreaTypeLabels(tradeNameOf(apt), ...(apt.silvApiNames ?? []));
  /** "34B·34C"처럼 그 면적의 타입 이름 (없으면 빈 문자열) */
  const typeOf = (area: string) => (typeLabels[String(parseFloat(area))] ?? []).join("·");
  /** "84.97㎡ (34B·34C)" */
  const areaLabel = (area: string) => `${area}㎡${typeOf(area) ? ` (${typeOf(area)})` : ""}`;
  const sortedTrades = [...trades].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  const sortedRents = [...rents].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  const sortedSilvs = [...silvs].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

  // 최근 1년
  const now = new Date();
  const yearAgo = `${now.getFullYear() - 1}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const lastYear = sortedTrades.filter((t) => sortKey(t) >= yearAgo);
  const silvLastYear = sortedSilvs.filter((t) => sortKey(t) >= yearAgo);

  // 면적별 요약 (최근 1년, 없으면 전체)
  const base = lastYear.length ? lastYear : sortedTrades;
  const groups = new Map<string, RawItem[]>();
  for (const t of base) groups.set(areaOf(t), [...(groups.get(areaOf(t)) ?? []), t]);
  const areaRows = Array.from(groups.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).map(([area, list]) => {
    const byPrice = [...list].sort((a, b) => man(b.dealAmount) - man(a.dealAmount));
    return { area, count: list.length, latest: list[0], max: byPrice[0], min: byPrice[byPrice.length - 1] };
  });

  // 가격 판단 기준 (같은 면적 거래의 중앙값·사분위·층별·전세가율)
  // 가격 그래프 면적 버튼의 타입 글자 (신고명이 매핑과 다르면 분양권 신고명으로도 찾음)
  const typeMaps = parseAptMapping().areaTypeMap;
  const typeMapKey = findMappingKey(typeMaps, [tradeNameOf(apt), ...(apt.silvApiNames ?? [])]);
  const chartTypeMap = typeMapKey ? typeMaps[typeMapKey] : {};

  // 매매 거래로 기준을 만들 수 없는 신축 단지는 분양권 거래로 계산
  const tradeGuides = buildPriceGuides(trades, rents);
  const guideIsSilv = !tradeGuides.length && silvs.length > 0;
  const guides = guideIsSilv ? buildPriceGuides(silvs, []) : tradeGuides;
  const diffText = (a: number, b: number) =>
    a === b ? "같습니다" : `${price(Math.abs(a - b))} 원 ${a > b ? "높습니다" : "낮습니다"}`;

  // 아파트 매매가 없으면(신축) 분양권 거래로 그래프
  const chartIsSilv = !trades.length && silvs.length > 0;
  const chartComplex = trades.length ? buildComplexList(trades)[0] : chartIsSilv ? buildComplexList(silvs)[0] : null;
  const reviewsEnabled = isReviewEnabled(apt.id);
  const reviews = reviewsEnabled ? await listApprovedReviews(apt.id) : [];
  const rentText = (r: RentRawItem) => {
    const dep = man(r.deposit), mon = man(r.monthlyRent);
    return mon ? `${price(dep)} / 월 ${mon.toLocaleString("ko-KR")}만` : `전세 ${price(dep)}`;
  };

  // 데이터로 만든 문장 요약 (매일 자동 갱신)
  const summary: string[] = [];
  if (lastYear.length && areaRows.length) {
    const top = [...areaRows].sort((a, b) => b.count - a.count)[0];
    const latest = sortedTrades[0];
    summary.push(
      `${eunneun(fullName)} 최근 1년 동안 ${lastYear.length}건 매매 거래되었습니다. 가장 많이 거래된 면적은 전용 ${areaLabel(top.area)} ${top.count}건이고, 가장 최근 거래는 ${dateOf(latest)} 전용 ${areaLabel(areaOf(latest))} ${latest.floor}층 ${price(man(latest.dealAmount))} 원입니다.`
    );
    summary.push(
      `같은 기간 전용 ${areaLabel(top.area)}는 최고 ${price(man(top.max.dealAmount))} 원(${top.max.floor}층)${top.count > 1 ? `, 최저 ${price(man(top.min.dealAmount))} 원(${top.min.floor}층)` : ""}에 거래되었습니다.`
    );
  } else if (sortedTrades.length) {
    summary.push(`${eunneun(fullName)} 최근 1년 동안 매매 거래가 없었고, 마지막 거래는 ${dateOf(sortedTrades[0])} ${price(man(sortedTrades[0].dealAmount))} 원입니다.`);
  }
  if (sortedSilvs.length) {
    const s0 = sortedSilvs[0];
    summary.push(
      silvLastYear.length
        ? `분양권은 최근 1년 동안 ${silvLastYear.length}건 거래되었고, 가장 최근 거래는 ${dateOf(s0)} 전용 ${areaLabel(areaOf(s0))} ${s0.floor}층 ${price(man(s0.dealAmount))} 원입니다.`
        : `분양권 마지막 거래는 ${dateOf(s0)} 전용 ${areaLabel(areaOf(s0))} ${price(man(s0.dealAmount))} 원입니다.`
    );
  }
  const lastJeonse = sortedRents.find((r) => !man(r.monthlyRent));
  if (lastJeonse) {
    summary.push(`전세는 최근 ${dateOf(lastJeonse)} 전용 ${areaLabel(areaOf(lastJeonse))}가 보증금 ${price(man(lastJeonse.deposit))} 원에 계약되었습니다.`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BackButton fallback="/real-estate" />
      <p className="mt-4 text-sm text-muted">
        <Link href={`/real-estate/${vr.regionId}`} className="hover:text-accent hover:underline">{vr.regionName} 시세 비교</Link> · {apt.address}
      </p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-black text-gray-900">{fullName} 실거래가 추이</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/vr-tour/${vr.regionId}/${vr.slug}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-white text-sm font-semibold">
          <Eye size={15} /> VR투어·평면도
        </Link>
        <Link href={`/map?aptId=${apt.id}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-sm font-semibold text-gray-700">
          <MapPin size={15} /> 지도에서 보기
        </Link>
      </div>

      {/* 요약 */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          chartIsSilv ? ["최근 1년 분양권", `${silvLastYear.length}건`] : ["최근 1년 매매", `${lastYear.length}건`],
          [chartIsSilv ? "최근 분양권 거래가" : "최근 거래가", (sortedTrades[0] ?? sortedSilvs[0]) ? `${price(man((sortedTrades[0] ?? sortedSilvs[0]).dealAmount))}` : "-"],
          ["세대수", apt.hoCnt ? `${apt.hoCnt.toLocaleString()}세대` : "-"],
          ["입주", apt.buildYear ? `${apt.buildYear}년` : "-"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs text-muted">{k}</p>
            <p className="mt-1 text-lg font-black text-gray-900">{v}</p>
          </div>
        ))}
      </section>

      {summary.length > 0 && (
        <div className="complex-description mt-8">
          {summary.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      )}

      <div className="complex-description mt-10">
        <h2>전용면적별 시세 {lastYear.length ? "(최근 1년)" : "(전체 기간)"}</h2>
        {areaRows.length ? (
          <table>
            <tbody>
              <tr><th>전용</th><th>최근 거래</th><th>최고가</th><th>최저가</th></tr>
              {areaRows.map((r) => (
                <tr key={r.area}>
                  <td style={{ whiteSpace: "nowrap" }}>{r.area}㎡<br /><span style={{ fontSize: 12, color: "#6b7280" }}>{typeOf(r.area) ? `${typeOf(r.area)} · ` : ""}{r.count}건</span></td>
                  <td><span style={{ whiteSpace: "nowrap" }}>{price(man(r.latest.dealAmount))}</span><br /><span style={{ fontSize: 12, color: "#6b7280" }}>{dateOf(r.latest)} · {r.latest.floor}층</span></td>
                  <td><span style={{ whiteSpace: "nowrap" }}>{price(man(r.max.dealAmount))}</span><br /><span style={{ fontSize: 12, color: "#6b7280" }}>{r.max.floor}층</span></td>
                  <td>{r.count > 1 ? <><span style={{ whiteSpace: "nowrap" }}>{price(man(r.min.dealAmount))}</span><br /><span style={{ fontSize: 12, color: "#6b7280" }}>{r.min.floor}층</span></> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>최근 매매 거래가 없습니다.</p>
        )}
      </div>

      {guides.length > 0 && (
        <div className="complex-description mt-10">
          <h2>가격 판단 기준{guideIsSilv ? " (분양권)" : ""}</h2>
          <p>
            {guideIsSilv && "아직 아파트 매매 거래가 적어 분양권 거래로 계산했습니다. 분양권 가격에는 분양가와 프리미엄이 함께 들어 있습니다. "}
            같은 전용면적의 실제 거래를 모아 중앙값과 가격 범위를 계산했습니다. 상담이나 매물에서 본 가격이 이 단지에서 높은 편인지
            낮은 편인지 가늠할 때 기준으로 활용하세요. 직거래는 시세와 다르게 신고되는 경우가 많아 계산에서 뺐습니다.
          </p>
          {guides.map((g) => {
            const common = [...g.bands].sort((a, b) => b.count - a.count)[0];
            const lowFloor = g.floors[0], highFloor = g.floors[g.floors.length - 1];
            return (
              <div key={g.area}>
                <h3>전용 {areaLabel(g.area)}</h3>
                <p>
                  최근 {g.years}년 거래 {g.count}건의 중앙값은 <strong>{price(g.median)} 원</strong>입니다. 거래의 절반이{" "}
                  {price(g.p25)}~{price(g.p75)} 원 사이에 있어, <strong>{price(g.p25)} 원 아래면 낮은 편, {price(g.p75)} 원 위면 높은 편</strong>입니다.
                  {common && ` 가장 많이 거래된 가격대는 ${common.label}(${common.count}건)입니다.`}
                </p>
                <table>
                  <tbody>
                    <tr><th>기준</th><th>금액</th></tr>
                    <tr><td>중앙값</td><td style={{ whiteSpace: "nowrap" }}><strong>{price(g.median)}</strong></td></tr>
                    <tr><td>하위 25% / 상위 25%</td><td style={{ whiteSpace: "nowrap" }}>{price(g.p25)} 이하 / {price(g.p75)} 이상</td></tr>
                    <tr><td>최저 ~ 최고</td><td style={{ whiteSpace: "nowrap" }}>{price(g.min)} ~ {price(g.max)}</td></tr>
                    <tr><td>가격대 분포</td><td>{g.bands.map((b) => `${b.label} ${b.count}건`).join(" · ")}</td></tr>
                  </tbody>
                </table>
                {g.floors.length >= 2 && (
                  <>
                    <table>
                      <tbody>
                        <tr><th>층</th><th>거래</th><th>중앙값</th></tr>
                        {g.floors.map((f) => (
                          <tr key={f.label}><td>{f.label}</td><td>{f.count}건</td><td style={{ whiteSpace: "nowrap" }}>{price(f.median)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <p>
                      {highFloor.label} 거래의 중앙값이 {lowFloor.label}보다 {diffText(highFloor.median, lowFloor.median)}. 같은 층대라도
                      동·향·조망과 확장·수리 상태에 따라 가격이 달라집니다.
                    </p>
                  </>
                )}
                {(g.recentMedian !== undefined || g.jeonseRatio !== undefined) && (
                  <p>
                    {g.recentMedian !== undefined &&
                      `최근 3개월 거래 ${g.recentCount}건의 중앙값은 ${price(g.recentMedian)} 원으로, 최근 ${g.years}년 중앙값보다 ${diffText(g.recentMedian, g.median)}. `}
                    {g.jeonseRatio !== undefined &&
                      `같은 면적 전세 보증금 중앙값은 ${price(g.jeonseMedian!)} 원(최근 1년 ${g.jeonseCount}건)으로, 매매 중앙값 대비 전세가율은 약 ${g.jeonseRatio}%입니다.`}
                  </p>
                )}
              </div>
            );
          })}
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            ※ 거래가 5건 이상인 면적만, 최근 1년 거래가 5건 미만이면 최근 2년 거래로 계산했습니다. 중앙값은 거래가를 줄 세웠을 때 가운데 값으로,
            아주 비싸거나 싼 거래 몇 건에 덜 흔들립니다. 실제 시세는 매물 상태와 시장 상황에 따라 달라질 수 있습니다.
          </p>
        </div>
      )}

      {chartComplex && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
            <TrendingUp size={20} className="text-accent" /> 가격 추이{chartIsSilv ? " (분양권)" : ""}
          </h2>
          <div className="rounded-2xl border border-border bg-white p-4">
            <ComplexPriceChart
              complex={{ ...chartComplex, name: fullName }}
              rentItems={rents}
              areaTypeMap={{ [tradeNameOf(apt)]: chartTypeMap }}
              tradeName={tradeNameOf(apt)}
            />
          </div>
        </section>
      )}

      <div className="complex-description mt-10">
        <h2>최근 매매 거래</h2>
        {sortedTrades.length ? (
          <table>
            <tbody>
              <tr><th>계약일</th><th>전용</th><th>층</th><th>거래가</th></tr>
              {sortedTrades.slice(0, 20).map((t, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: "nowrap" }}>{dateOf(t)}</td>
                  <td>{areaLabel(areaOf(t))}</td>
                  <td>{t.floor}층</td>
                  <td style={{ whiteSpace: "nowrap" }}>{price(man(t.dealAmount))}{t.dealingGbn === "직거래" && <span style={{ fontSize: 12, color: "#6b7280" }}> (직거래)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>매매 거래가 없습니다.</p>
        )}
        {ambiguousCount > 0 && (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            ※ 같은 이름으로 신고된 거래 중 동 정보가 없는 {ambiguousCount}건은 어느 단지 거래인지 구분할 수 없어 제외했습니다.
            전월세 자료도 단지를 구분할 정보가 없어 표시하지 않습니다.
          </p>
        )}

        {sortedSilvs.length > 0 && (
          <>
            <h2>최근 분양권 거래</h2>
            <table>
              <tbody>
                <tr><th>계약일</th><th>전용</th><th>층</th><th>거래가</th></tr>
                {sortedSilvs.slice(0, 20).map((t, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: "nowrap" }}>{dateOf(t)}</td>
                    <td>{areaLabel(areaOf(t))}</td>
                    <td>{t.floor}층</td>
                    <td style={{ whiteSpace: "nowrap" }}>{price(man(t.dealAmount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2>최근 전월세 거래</h2>
        {sortedRents.length ? (
          <table>
            <tbody>
              <tr><th>계약일</th><th>전용</th><th>층</th><th>보증금 / 월세</th></tr>
              {sortedRents.slice(0, 10).map((r, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: "nowrap" }}>{dateOf(r)}</td>
                  <td>{areaLabel(areaOf(r))}</td>
                  <td>{r.floor}층</td>
                  <td style={{ whiteSpace: "nowrap" }}>{rentText(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>전월세 거래가 없습니다.</p>
        )}

        <p style={{ fontSize: 13, color: "#6b7280" }}>
          ※ 국토교통부 실거래가 공개 자료 기준이며 계약 해제 거래는 제외했습니다. 실거래 신고는 계약 후 30일 이내에 이뤄져
          최근 거래는 나중에 추가될 수 있습니다. 금액 단위는 원입니다.
        </p>
      </div>

      {reviewsEnabled && <ComplexReviews complexId={apt.id} complexName={fullName} reviews={reviews} />}
    </div>
  );
}
