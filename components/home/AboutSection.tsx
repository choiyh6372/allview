import Link from "next/link";
import { Eye, TrendingUp, ShieldCheck } from "lucide-react";
import { getVRUrl } from "@/lib/vrData";

const points = [
  { icon: Eye, text: "직접 방문 전, VR로 집 안을 먼저 확인" },
  { icon: TrendingUp, text: "국토부 실거래 데이터 기반 정확한 시세" },
  { icon: ShieldCheck, text: "명지·에코델타 전 단지 정보를 한 곳에" },
];

export default function AboutSection() {
  const vrUrl = getVRUrl("kukje", "posco2", "32a");

  return (
    <section className="py-20 border-y border-border bg-bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-5">
            AllView360은 이렇게 다릅니다
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            발품 팔지 않아도 괜찮습니다. AllView360은 명지오션시티, 명지국제신도시, 에코델타시티 아파트의 실제 내부를 360° VR로 촬영해 보여드립니다.
            <br />
            평형별 배치도에서 원하는 타입을 선택하면 실제 거실, 주방, 방까지 마치 현장에 있는 것처럼 둘러볼 수 있습니다.
          </p>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <span className="flex-shrink-0 p-2 rounded-lg bg-accent/10 text-accent">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-medium text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/posco-32a-1.jpg"
            alt="포스코 2단지 32A 타입 거실 VR 촬영 이미지"
            className="w-full rounded-2xl border border-border object-cover aspect-[16/9]"
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/posco-32a-2.jpg"
            alt="포스코 2단지 32A 타입 거실 및 주방 VR 촬영 이미지"
            className="w-full rounded-2xl border border-border object-cover aspect-[16/9]"
            loading="lazy"
          />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">VR투어 미리 체험해보기</h3>
          <p className="text-gray-600 text-sm">
            포스코 2단지 32A 타입 · 드래그해서 실내를 360° 둘러보세요
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border shadow-sm">
          <iframe
            src={vrUrl}
            className="w-full aspect-video"
            style={{ minHeight: 440 }}
            allowFullScreen
            allow="xr-spatial-tracking"
            title="포스코 2단지 32A VR 투어 샘플"
          />
        </div>

        <div className="text-center mt-8">
          <Link
            href="/vr-tour"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors text-sm"
          >
            다른 단지 VR투어도 둘러보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
