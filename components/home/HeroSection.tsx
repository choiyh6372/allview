import Link from "next/link";
import VRProgressCards from "@/components/home/VRProgressCards";

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
            부산 강서구 부동산 통합 플랫폼
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            부동산의 모든 것을<br />
            <span className="text-accent">한 눈에</span> 확인하세요
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
            VR 가상투어로 집을 직접 방문하지 않아도 생생하게,
            실거래가로 시장 흐름을 정확하게,
            주변 상권 정보까지 AllView360 하나로.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/vr-tour"
              className="w-40 text-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors text-sm"
            >
              VR투어 시작하기
            </Link>
            <Link
              href="/real-estate"
              className="w-40 text-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors text-sm"
            >
              실거래가 조회
            </Link>
            <Link
              href="/map"
              className="w-40 text-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors text-sm"
            >
              지도보기
            </Link>
          </div>
        </div>

        {/* VR 완성도 카드 */}
        <VRProgressCards />
      </div>
    </section>
  );
}
