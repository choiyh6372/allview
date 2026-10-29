import Link from "next/link";
import { Home } from "lucide-react";
import { getSubscriptions } from "@/lib/subscription";
import SubscriptionList from "@/components/subscription/SubscriptionList";

// 청약홈 공고는 하루 단위로 갱신되므로 페이지도 하루마다 다시 만든다
export const revalidate = 86400;

const blog = (slug: string) => `/blog/${encodeURIComponent(slug)}`;

const STATUS_GUIDE = [
  { label: "청약중", text: "오늘이 청약 접수 기간 안에 있는 공고입니다." },
  { label: "청약예정", text: "모집공고는 났지만 아직 접수가 시작되지 않은 공고입니다." },
  { label: "완료", text: "접수가 끝난 공고로, 최근 3개월 안에 마감된 것만 보여드립니다." },
  { label: "무순위", text: "미계약·계약취소 등으로 다시 나온 물량입니다. 청약통장 없이 신청할 수 있는 경우가 많습니다." },
];

const CHECKLIST = [
  { text: "청약통장 가입기간·예치금이 1순위 조건을 채우는지", href: blog("청약통장-1순위-조건"), link: "청약통장 1순위 조건" },
  { text: "가점제 물량이라면 내 청약 가점이 몇 점인지", href: blog("청약-가점-계산법-점수표"), link: "청약 가점 계산법" },
  { text: "신혼부부·생애최초 특별공급 자격이 되는지", href: blog("신혼부부-특별공급-조건"), link: "신혼부부 특별공급 조건" },
  { text: "분양권도 주택 수에 들어가는 점과 세금", href: blog("분양권-입주권-차이"), link: "분양권 입주권 차이" },
];

export default async function SubscriptionPage() {
  const { items, error } = await getSubscriptions();
  const serverToday = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-bg-card text-orange-400">
          <Home size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">부산 분양정보</h1>
          <p className="text-sm text-muted mt-0.5">
            청약홈 아파트 분양 공고 · 최근 3개월
            {items.length > 0 && <span className="ml-2">· 총 {items.length}건</span>}
          </p>
        </div>
      </div>

      <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">
        한국부동산원 청약홈에 올라온 부산 아파트 분양·무순위 공고를 모아 청약 일정 순으로 정리했습니다.
        공고는 하루 한 번 갱신되며, 각 카드의 &lsquo;청약홈&rsquo; 링크에서 입주자모집공고 원문을 확인할 수 있습니다.
      </p>

      <SubscriptionList items={items} error={!!error && items.length === 0} serverToday={serverToday} />

      {/* 이용 안내 (서버에서 렌더링되는 고정 안내) */}
      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">분양정보 보는 법</h2>
          <dl className="space-y-3 text-sm">
            {STATUS_GUIDE.map((g) => (
              <div key={g.label}>
                <dt className="font-semibold text-gray-900">{g.label}</dt>
                <dd className="text-gray-600 leading-relaxed">{g.text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            분양가·전매제한·재당첨제한 등 세부 조건은 단지마다 다르므로 반드시 입주자모집공고 원문으로 확인하세요.
            공고 정정이나 일정 변경은 청약홈 반영 시점에 따라 이곳에 늦게 나타날 수 있습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">청약 신청 전 확인할 것</h2>
          <ul className="space-y-3 text-sm">
            {CHECKLIST.map((c) => (
              <li key={c.href} className="text-gray-600 leading-relaxed">
                {c.text} –{" "}
                <Link href={c.href} className="text-accent font-semibold hover:underline">{c.link}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            주변 단지 시세는 <Link href="/real-estate" className="text-accent hover:underline">실거래가</Link>,
            위치는 <Link href="/map" className="text-accent hover:underline">지도</Link>에서 함께 비교해 보세요.
          </p>
        </div>
      </section>
    </div>
  );
}
