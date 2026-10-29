import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexData, getComplexFullName } from "@/lib/vrData";
import { APT_COMPLEXES } from "@/lib/mapData";
import { getManyComplexTrades, TRADE_PAGE_COMPLEXES, tradeNameOf } from "@/lib/complexTrades";
import { getAreaTypeLabels } from "@/lib/areaTypeLabels";
import { findMappingKey, parseAptMapping } from "@/lib/parseAptMapping";
import { buildCompareRow, type ComplexCompareRow } from "@/lib/regionCompare";
import BackButton from "@/components/common/BackButton";

export const revalidate = 3600;
export const dynamicParams = false;

const REGIONS: Record<string, string> = {
  ocean: "명지오션시티",
  kukje: "명지국제신도시",
  ecodelta: "에코델타시티",
};

export function generateStaticParams() {
  return Object.keys(REGIONS).map((regionId) => ({ regionId }));
}

type Props = { params: { regionId: string } };

export function generateMetadata({ params }: Props): Metadata {
  const name = REGIONS[params.regionId];
  if (!name) return {};
  return {
    title: `${name} 아파트 시세 비교·3.3㎡당 가격 순위 | AllView`,
    description: `${name} 아파트 단지별 최근 1년 실거래가 중앙값, 공급면적 3.3㎡당 가격, 거래량, 전세가율을 국토교통부 실거래가 자료로 비교합니다. 매일 자동 갱신.`,
    alternates: { canonical: `/real-estate/${params.regionId}` },
  };
}

const price = (v: number) => {
  const eok = Math.floor(v / 10000), rest = v % 10000;
  return `${eok ? `${eok}억` : ""}${rest ? ` ${rest.toLocaleString("ko-KR")}` : ""}${eok && !rest ? "" : "만"}`.trim();
};
const small = { fontSize: 12, color: "#6b7280" } as const;

/** 단지 이름 뒤 주격 조사 (받침 있으면 "이", 없으면 "가") */
const iga = (name: string) => {
  const code = name.trim().charCodeAt(name.trim().length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 ? `${name}이` : `${name}가`;
  return `${name}이(가)`;
};

export default async function RegionComparePage({ params }: Props) {
  const regionName = REGIONS[params.regionId];
  if (!regionName) notFound();

  const vrs = complexData.filter((c) => c.regionId === params.regionId && TRADE_PAGE_COMPLEXES.includes(c.id));
  const apts = vrs.map((v) => APT_COMPLEXES.find((a) => a.id === v.id)!).filter(Boolean);
  const all = await getManyComplexTrades(apts);
  const { supplyAreaMap } = parseAptMapping();

  const now = new Date();
  const yearAgo = `${now.getFullYear() - 1}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const names = (id: string) => {
    const apt = APT_COMPLEXES.find((a) => a.id === id)!;
    return [tradeNameOf(apt), ...(apt.silvApiNames ?? [])];
  };
  const rows: ComplexCompareRow[] = apts.map((apt) => {
    const key = findMappingKey(supplyAreaMap, names(apt.id));
    return buildCompareRow(apt, all[apt.id], key ? supplyAreaMap[key] : {}, yearAgo);
  });
  const vrOf = (id: string) => vrs.find((v) => v.id === id)!;
  const nameOf = (id: string) => getComplexFullName(vrOf(id));
  const link = (id: string) => `/real-estate/${params.regionId}/${vrOf(id).slug}`;
  const areaLabel = (id: string, area: string) => {
    const t = (getAreaTypeLabels(...names(id))[String(parseFloat(area))] ?? []).join("·");
    return `${area}㎡${t ? ` (${t})` : ""}`;
  };

  const ranked = rows.filter((r) => r.perPyeong).sort((a, b) => b.perPyeong! - a.perPyeong!);
  const unranked = rows.filter((r) => !r.perPyeong);
  const byVolume = [...rows].sort((a, b) => b.tradeCount + b.silvCount - (a.tradeCount + a.silvCount));
  const jeonseRows = rows.filter((r) => r.jeonseRatio).sort((a, b) => b.jeonseRatio! - a.jeonseRatio!);
  const totalTrades = rows.reduce((s, r) => s + r.tradeCount, 0);
  const totalSilvs = rows.reduce((s, r) => s + r.silvCount, 0);
  const households = apts.reduce((s, a) => s + (a.hoCnt ?? 0), 0);
  const years = apts.map((a) => a.buildYear).filter((y): y is number => !!y);
  const anySilvBasis = rows.some((r) => r.basis === "분양권");

  // 데이터로 만든 요약 문장
  const summary: string[] = [];
  summary.push(
    `AllView360에 등록된 ${regionName} 아파트는 ${apts.length}개 단지${households ? `, 약 ${households.toLocaleString("ko-KR")}세대` : ""}입니다.` +
      (years.length ? ` 입주 연도는 ${Math.min(...years)}년부터 ${Math.max(...years)}년까지입니다.` : "")
  );
  summary.push(
    `최근 1년 동안 매매 ${totalTrades.toLocaleString("ko-KR")}건${totalSilvs ? `, 분양권 ${totalSilvs.toLocaleString("ko-KR")}건` : ""}이 거래되었고, 가장 거래가 많은 단지는 ${nameOf(byVolume[0].apt.id)}입니다.`
  );
  if (ranked.length >= 2) {
    const hi = ranked[0], lo = ranked[ranked.length - 1];
    summary.push(
      `공급면적 3.3㎡당 가격은 ${iga(nameOf(hi.apt.id))} ${price(hi.perPyeong!)} 원으로 가장 높고, ${iga(nameOf(lo.apt.id))} ${price(lo.perPyeong!)} 원으로 가장 낮아 ${price(hi.perPyeong! - lo.perPyeong!)} 원 차이가 납니다.`
    );
  }
  if (jeonseRows.length >= 2) {
    summary.push(
      `전세가율(대표 면적 기준)은 ${jeonseRows[jeonseRows.length - 1].jeonseRatio}%~${jeonseRows[0].jeonseRatio}% 사이이며, ${iga(nameOf(jeonseRows[0].apt.id))} 가장 높습니다.`
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BackButton fallback="/real-estate" />
      <h1 className="mt-4 text-2xl sm:text-3xl font-black text-gray-900">{regionName} 아파트 시세 비교</h1>

      <nav className="mt-5 grid grid-cols-3 gap-2" aria-label="지역 선택">
        {Object.entries(REGIONS).map(([id, name]) => (
          <Link
            key={id}
            href={`/real-estate/${id}`}
            className={`px-2 py-2.5 rounded-lg text-center text-sm font-semibold break-keep ${
              id === params.regionId ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:border-accent/40"
            }`}
          >
            {name}
          </Link>
        ))}
      </nav>

      <div className="complex-description mt-8">
        {summary.map((t, i) => (
          <p key={i}>{t}</p>
        ))}

        <h2>3.3㎡당 가격 순위</h2>
        <p>
          단지마다 평형 구성이 달라 총액으로는 비교하기 어려워, 최근 1년 거래가를 <strong>공급면적 3.3㎡(1평)당 가격</strong>으로 바꿔 중앙값을 냈습니다.
          {anySilvBasis && " 아직 매매가 적은 신축 단지는 분양권 거래(분양가+프리미엄)로 계산해 함께 표시했습니다."}
        </p>
        <table>
          <tbody>
            <tr><th>순위</th><th>단지</th><th>3.3㎡당</th><th>대표 면적 중앙값</th></tr>
            {ranked.map((r, i) => (
              <tr key={r.apt.id}>
                <td>{i + 1}</td>
                <td>
                  <Link href={link(r.apt.id)}>{nameOf(r.apt.id)}</Link>
                  <br /><span style={small}>{r.basis === "분양권" ? "분양권 기준" : "매매 기준"} · {r.perPyeongCount}건</span>
                </td>
                <td style={{ whiteSpace: "nowrap" }}><strong>{price(r.perPyeong!)}</strong></td>
                <td>
                  <span style={{ whiteSpace: "nowrap" }}>{price(r.repMedian!)}</span>
                  <br /><span style={small}>전용 {areaLabel(r.apt.id, r.repArea!)} · {r.repCount}건</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {unranked.length > 0 && (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            ※ 최근 1년 거래가 적거나 공급면적 자료가 없어 순위에서 뺀 단지: {unranked.map((r) => nameOf(r.apt.id)).join(", ")}
          </p>
        )}

        <h2>최근 1년 거래량</h2>
        <table>
          <tbody>
            <tr><th>단지</th><th>매매</th><th>분양권</th><th>세대수 · 입주</th></tr>
            {byVolume.map((r) => (
              <tr key={r.apt.id}>
                <td><Link href={link(r.apt.id)}>{nameOf(r.apt.id)}</Link></td>
                <td>{r.tradeCount}건</td>
                <td>{r.silvCount ? `${r.silvCount}건` : "-"}</td>
                <td>
                  {r.apt.hoCnt ? `${r.apt.hoCnt.toLocaleString("ko-KR")}세대` : "-"}
                  {r.apt.buildYear ? <><br /><span style={small}>{r.apt.buildYear}년</span></> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          거래량이 많을수록 시세가 자주 확인되어 가격 판단이 쉽습니다. 세대수 대비 거래가 적은 단지는 최근 거래 몇 건이 시세처럼 보일 수 있으니,
          단지 페이지의 가격 판단 기준과 최근 거래 내역을 함께 확인하세요.
        </p>

        {jeonseRows.length > 0 && (
          <>
            <h2>전세가율 비교</h2>
            <p>대표 면적의 최근 1년 전세 보증금 중앙값을 매매 중앙값으로 나눈 비율입니다. 전세가율이 높을수록 매매가와 전세가 차이가 작습니다.</p>
            <table>
              <tbody>
                <tr><th>단지</th><th>전세가율</th><th>전세 중앙값</th></tr>
                {jeonseRows.map((r) => (
                  <tr key={r.apt.id}>
                    <td>
                      <Link href={link(r.apt.id)}>{nameOf(r.apt.id)}</Link>
                      <br /><span style={small}>전용 {areaLabel(r.apt.id, r.repArea!)}</span>
                    </td>
                    <td><strong>약 {r.jeonseRatio}%</strong></td>
                    <td style={{ whiteSpace: "nowrap" }}>{price(r.jeonseMedian!)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2>이 표를 볼 때 알아둘 점</h2>
        <ul>
          <li><strong>3.3㎡당 가격은 공급면적 기준</strong>입니다. 전용면적 기준 평당가와는 숫자가 다릅니다(<Link href={`/blog/${encodeURIComponent("전용면적-공급면적-차이-평수-계산법")}`}>전용면적·공급면적 차이</Link> 참고).</li>
          <li><strong>중앙값</strong>은 거래가를 줄 세웠을 때 가운데 값이라 아주 비싸거나 싼 거래 몇 건에 덜 흔들립니다. 직거래는 계산에서 뺐습니다.</li>
          <li>같은 단지라도 동·층·향과 확장·수리 상태에 따라 가격 차이가 큽니다. 단지 이름을 누르면 면적별 가격 판단 기준과 최근 거래를 볼 수 있습니다.</li>
          <li>세 지역의 입지·학교·주차 비교는 <Link href={`/blog/${encodeURIComponent("명지오션시티-명지국제신도시-에코델타시티-비교")}`}>명지오션시티·명지국제신도시·에코델타시티 비교</Link>에 정리했습니다.</li>
        </ul>

        <p style={{ fontSize: 13, color: "#6b7280" }}>
          ※ 국토교통부 아파트 매매·분양권·전월세 실거래가 공개 자료로 매일 자동 계산합니다. 계약 해제 거래는 제외했고, 실거래 신고는 계약 후 30일 이내에
          이뤄져 최근 거래는 나중에 추가될 수 있습니다. 공급면적은 분양 당시 자료 기준입니다.
        </p>
      </div>
    </div>
  );
}
