import Link from "next/link";

// 홈 안내 글: 실거래가를 볼 때 확인할 순서와 사이트 기능 연결

const steps = [
  {
    title: "지역 시세부터 봅니다",
    text: "같은 강서구라도 명지오션시티·명지국제신도시·에코델타시티는 입주 시기와 평형 구성이 달라 가격대가 다릅니다. 총액은 평형마다 달라 비교가 어려우니, 공급면적 3.3㎡당 가격으로 단지들을 줄 세워 보면 내가 보는 단지가 지역에서 어느 위치인지 감이 잡힙니다.",
    link: { href: "/real-estate/kukje", label: "지역별 시세 비교" },
  },
  {
    title: "같은 전용면적끼리 비교합니다",
    text: "같은 단지라도 전용 84㎡와 59㎡는 전혀 다른 상품입니다. 면적이 같아도 타입(34A·34B 등)에 따라 구조가 다르므로, 실거래가는 반드시 같은 전용면적 거래끼리 봐야 합니다. 단지 페이지에서는 면적별 중앙값과 하위·상위 25% 가격을 계산해 두었습니다.",
    link: { href: "/real-estate/ocean/kukdong", label: "단지 가격 판단 기준 예시" },
  },
  {
    title: "층·동·거래 방식을 확인합니다",
    text: "저층과 고층은 같은 면적이라도 수천만 원씩 차이가 납니다. 가족 간 직거래는 시세보다 낮게 신고되는 경우가 많고, 계약 후 해제된 거래도 있습니다. 최고가·최저가 한 건만 보지 말고 층수와 거래 방식을 함께 보세요.",
    link: null,
  },
  {
    title: "구조는 평면도와 VR로 봅니다",
    text: "가격이 비슷한 두 단지라면 결국 구조와 동선이 선택을 가릅니다. 거실·주방·방의 연결은 평면도만으로 파악하기 어려우니 360° VR로 직접 둘러보고, VR이 없는 평형은 평면도로 확인하세요.",
    link: { href: "/vr-tour", label: "아파트 VR·평면도" },
  },
  {
    title: "부대비용까지 계산합니다",
    text: "매매가 외에도 취득세(지방교육세·농특세 포함), 중개수수료, 등기 비용이 듭니다. 3억 원 아파트(1주택·85㎡ 이하)라면 취득세 약 330만 원과 중개수수료 상한 120만 원을 잔금과 함께 준비해야 합니다.",
    link: { href: "/tools", label: "부동산 계산기" },
  },
];

export default function PriceGuideSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-accent mb-2">HOW TO READ</p>
          <h2 className="text-3xl font-black text-gray-900 mb-4">아파트 실거래가, 이 순서로 보세요</h2>
          <p className="text-gray-600 leading-relaxed">
            실거래가는 실제로 계약된 가격이라 가장 믿을 만한 시세 자료지만, 숫자 하나만 보고 판단하면 오해하기 쉽습니다.
            거래가 적은 단지는 한두 건이 시세처럼 보이고, 같은 단지 안에서도 면적·층·동에 따라 가격 차이가 큽니다.
            부산 강서구 아파트를 알아볼 때 아래 순서로 확인하면 상담에서 들은 가격이 적정한지 스스로 가늠할 수 있습니다.
          </p>
        </div>

        <ol className="space-y-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-1.5 text-gray-600 leading-relaxed">{s.text}</p>
                {s.link && (
                  <Link href={s.link.href} className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">
                    {s.link.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-muted leading-relaxed">
          실거래 신고는 계약 후 30일 이내에 이뤄지므로 최근 한 달 거래는 나중에 더 늘어날 수 있습니다. 매달 초에는{" "}
          <Link href="/blog" className="text-accent font-semibold hover:underline">블로그</Link>에 명지 아파트 월간 실거래가를 정리해 올립니다.
        </p>
        </div>
      </div>
    </section>
  );
}
