import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            부산 부동산 통합 플랫폼
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            부동산의 모든 것을<br />
            <span className="text-accent">한 눈에</span> 확인하세요
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
            VR 가상투어로 집을 직접 방문하지 않아도 생생하게,
            실거래가로 시장 흐름을 정확하게,
            주변 상권 정보까지 AllView 하나로.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/vr-tour"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors text-sm"
            >
              VR투어 시작하기
            </Link>
            <Link
              href="/real-estate"
              className="px-6 py-3 bg-bg-card hover:bg-bg-hover border border-border text-white font-semibold rounded-xl transition-colors text-sm"
            >
              실거래가 조회
            </Link>
          </div>
        </div>

        {/* decorative grid cards */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 pr-8">
          {[
            { label: "오션시티 A동", badge: "VR", color: "text-blue-400" },
            { label: "에코델타 2단지", badge: "매매", color: "text-green-400" },
            { label: "국제신도시 B타워", badge: "전세", color: "text-purple-400" },
          ].map((c) => (
            <div key={c.label} className="w-52 p-4 rounded-xl bg-bg-card border border-border backdrop-blur">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">{c.label}</span>
                <span className={`text-xs font-bold ${c.color}`}>{c.badge}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-hover mb-1">
                <div className="h-2 rounded-full bg-accent" style={{ width: "68%" }} />
              </div>
              <span className="text-xs text-muted">조회 진행중</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
