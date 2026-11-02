import Link from "next/link";
import { complexData, getComplexFullName } from "@/lib/vrData";
import { APT_COMPLEXES } from "@/lib/mapData";
import { getManyComplexTrades, MIN_RECORDS_FOR_INDEX, recordCount, TRADE_PAGE_COMPLEXES } from "@/lib/complexTrades";
import type { RawItem } from "@/lib/molitApi";

// 실거래가 메인 하단: 서버에서 계산한 최근 거래 요약과 단지별 페이지 링크 (검색엔진·첫 화면용)

const REGIONS: [string, string][] = [["ocean", "명지오션시티"], ["kukje", "명지국제신도시"], ["ecodelta", "에코델타시티"]];

const man = (s?: string) => parseInt((s ?? "0").replace(/,/g, ""), 10) || 0;
const keyOf = (i: { dealYear?: string; dealMonth?: string; dealDay?: string }) =>
  `${i.dealYear}${String(i.dealMonth).padStart(2, "0")}${String(i.dealDay).padStart(2, "0")}`;
const price = (v: number) => {
  const eok = Math.floor(v / 10000), rest = v % 10000;
  return `${eok ? `${eok}억` : ""}${rest ? ` ${rest.toLocaleString("ko-KR")}` : ""}${eok && !rest ? "" : "만"}`.trim();
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

export default async function RealEstateSummary() {
  const vrs = complexData.filter((c) => TRADE_PAGE_COMPLEXES.includes(c.id));
  const apts = vrs.map((v) => APT_COMPLEXES.find((a) => a.id === v.id)!).filter(Boolean);
  const all = await getManyComplexTrades(apts);
  const since = daysAgo(30);

  type Deal = RawItem & { id: string };
  const recent: Deal[] = apts.flatMap((a) => all[a.id].trades.filter((t) => keyOf(t) >= since).map((t) => ({ ...t, id: a.id })));
  const vrOf = (id: string) => vrs.find((v) => v.id === id)!;
  const nameOf = (id: string) => getComplexFullName(vrOf(id));
  const href = (id: string) => `/real-estate/${vrOf(id).regionId}/${vrOf(id).slug}`;

  const countBy = new Map<string, number>();
  for (const d of recent) countBy.set(d.id, (countBy.get(d.id) ?? 0) + 1);
  const top = Array.from(countBy.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const regionStats = REGIONS.map(([rid, rname]) => {
    const deals = recent.filter((d) => vrOf(d.id).regionId === rid);
    const max = [...deals].sort((a, b) => man(b.dealAmount) - man(a.dealAmount))[0];
    return { rid, rname, count: deals.length, max };
  });

  const indexed = vrs.filter((v) => recordCount(all[v.id]) >= MIN_RECORDS_FOR_INDEX);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="complex-description">
        <h2>최근 30일 실거래 요약</h2>
        <p>
          AllView360에 등록된 강서구 아파트 {apts.length}개 단지에서 최근 30일 동안 신고된 매매는 <strong>{recent.length}건</strong>입니다.
          {top.length > 0 && ` 가장 거래가 많은 단지는 ${nameOf(top[0][0])}(${top[0][1]}건)입니다.`} 실거래 신고는 계약 후 30일 이내에 이뤄지므로 최근 거래는 앞으로 더 늘어날 수 있습니다.
        </p>

        <table>
          <tbody>
            <tr><th>지역</th><th>최근 30일 매매</th><th>최고 거래가</th></tr>
            {regionStats.map((r) => (
              <tr key={r.rid}>
                <td><Link href={`/real-estate/${r.rid}`}>{r.rname}</Link></td>
                <td>{r.count}건</td>
                <td>
                  {r.max ? (
                    <>
                      <span style={{ whiteSpace: "nowrap" }}>{price(man(r.max.dealAmount))}</span>
                      <br />
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {nameOf(r.max.id)} · 전용 {(r.max.excluUseAr ?? "").trim()}㎡ · {r.max.floor}층
                      </span>
                    </>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {top.length > 0 && (
          <>
            <h3>최근 30일 거래 많은 단지</h3>
            <ol>
              {top.map(([id, n]) => (
                <li key={id}><Link href={href(id)}>{nameOf(id)}</Link> – {n}건</li>
              ))}
            </ol>
          </>
        )}

        <h2>단지별 실거래가 추이</h2>
        <p>단지를 누르면 전용면적별 시세와 가격 판단 기준(중앙값·하위/상위 25%), 가격 추이 그래프, 최근 매매·분양권·전월세 거래를 볼 수 있습니다.</p>
        {REGIONS.map(([rid, rname]) => {
          const list = indexed.filter((v) => v.regionId === rid).sort((a, b) => getComplexFullName(a).localeCompare(getComplexFullName(b), "ko"));
          if (!list.length) return null;
          return (
            <div key={rid}>
              <h3>{rname}</h3>
              <p style={{ lineHeight: 2 }}>
                {list.map((v, i) => (
                  <span key={v.id}>
                    {i > 0 && " · "}
                    <Link href={`/real-estate/${v.regionId}/${v.slug}`}>{getComplexFullName(v)}</Link>
                  </span>
                ))}
              </p>
            </div>
          );
        })}

        <p style={{ fontSize: 13, color: "#6b7280" }}>
          ※ 국토교통부 아파트 매매 실거래가 공개 자료 기준이며, 계약 해제 거래는 제외했습니다. 매일 자동으로 갱신됩니다.
        </p>
      </div>
    </section>
  );
}
