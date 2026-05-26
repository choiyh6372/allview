import Link from "next/link";
import { Eye, TrendingUp, Map } from "lucide-react";

const services = [
  {
    icon: Eye,
    title: "VR 가상투어",
    desc: "집을 직접 방문하지 않고도 360° VR로 모든 공간을 생생하게 탐색하세요. 오션시티, 국제신도시, 에코델타 단지를 실감나게 둘러볼 수 있습니다.",
    href: "/vr-tour",
    badge: "LIVE",
    gradient: "from-blue-500/10 to-accent/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "실거래가 조회",
    desc: "국토부 실거래 데이터를 기반으로 단지별·평형별 가격 흐름을 한눈에 확인하세요. 중위값과 범위 그래프로 시장 동향을 파악할 수 있습니다.",
    href: "/real-estate",
    badge: "DATA",
    gradient: "from-green-500/10 to-emerald-500/10",
    border: "border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Map,
    title: "지도 보기",
    desc: "카카오맵 기반으로 아파트 단지 위치와 주변 상권을 한눈에 확인하세요. 마커를 클릭하면 실거래가와 단지 정보를 바로 조회할 수 있습니다.",
    href: "/map",
    badge: "MAP",
    gradient: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
];

export default function ServiceCards() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-white mb-4">AllView360 핵심 서비스</h2>
          <p className="text-gray-400 text-base">부동산 탐색의 모든 단계를 하나의 플랫폼에서</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${s.gradient} border ${s.border} hover:border-accent/40 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-bg-card ${s.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-muted border border-border rounded px-2 py-0.5">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{s.desc}</p>
                <span className="text-sm font-semibold text-accent group-hover:underline">
                  바로가기 →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
