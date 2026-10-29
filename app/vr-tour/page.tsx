import Link from "next/link";
import { complexData } from "@/lib/vrData";
import VRComplexGrid from "@/components/vr/VRComplexGrid";

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

type Props = { searchParams: { region?: string } };

export default function VRTourPage({ searchParams }: Props) {
  const region = regions.includes(searchParams.region ?? "") ? searchParams.region! : regions[0];
  const filtered = complexData
    .filter((c) => c.regionName === region)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const summary = regions.map((r) => {
    const list = complexData.filter((c) => c.regionName === r);
    return {
      region: r,
      complexes: list.length,
      types: list.reduce((s, c) => s + c.types.length, 0),
      vr: list.filter((c) => !c.noVR).length,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">아파트 VR·평면도</h1>
        <p className="text-gray-600">VR이 준비된 단지는 360°로, 준비 중인 단지는 배치도와 평면도로 구조를 확인할 수 있습니다.</p>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8" aria-label="지역 선택">
        {regions.map((r) => (
          <Link
            key={r}
            href={`/vr-tour?region=${encodeURIComponent(r)}`}
            replace
            scroll={false}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              region === r ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40"
            }`}
          >
            {r}
          </Link>
        ))}
      </nav>

      <VRComplexGrid complexes={filtered} />

      {/* 이용 안내 */}
      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">VR·평면도 이용 방법</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 leading-relaxed">
            <li>단지를 고르면 동 배치도가 열립니다. 배치도 위 색깔 점은 평형(타입)별 위치입니다.</li>
            <li>VR이 있는 평형을 누르면 AllView360이 직접 촬영한 360° 실내 투어가 새 창으로 열립니다.</li>
            <li>VR이 없는 평형은 평면도로 구조를 확인할 수 있습니다.</li>
            <li>단지 페이지 아래에서 단지 소개, 실거래가 추이, 입주민 한줄 후기를 함께 볼 수 있습니다.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">지역별 등록 현황</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2 font-medium">지역</th>
                <th className="py-2 font-medium">단지</th>
                <th className="py-2 font-medium">평형</th>
                <th className="py-2 font-medium">VR 제공</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.region} className="border-b border-border last:border-0 text-gray-700">
                  <td className="py-2">{s.region}</td>
                  <td className="py-2">{s.complexes}개</td>
                  <td className="py-2">{s.types}개</td>
                  <td className="py-2">{s.vr ? `${s.vr}개 단지` : "평면도 제공"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            세 지역의 입지·학교·주차 비교는{" "}
            <Link href={`/blog/${encodeURIComponent("명지오션시티-명지국제신도시-에코델타시티-비교")}`} className="text-accent hover:underline">
              명지오션시티·명지국제신도시·에코델타시티 비교
            </Link>
            에서, 단지 시세는 <Link href="/real-estate" className="text-accent hover:underline">실거래가</Link>에서 확인하세요.
          </p>
        </div>
      </section>
    </div>
  );
}
