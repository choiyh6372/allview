import Link from "next/link";
import { Camera, Database, RefreshCw, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: Camera,
    title: "직접 제작한 공간 콘텐츠",
    text: "AllView360이 직접 촬영·제작한 평형만 360° VR로 표시합니다. VR이 없는 단지는 배치도와 평면도로 구분해 안내합니다.",
  },
  {
    icon: Database,
    title: "공식 공개자료를 기반으로",
    text: "실거래가는 국토교통부, 분양정보는 청약홈, 단지·주차 정보는 K-apt, 학구도는 교육기관 공개자료를 활용합니다.",
  },
  {
    icon: RefreshCw,
    title: "기준일과 반영 시차",
    text: "실거래가는 계약 신고 뒤 반영될 수 있고, 청약·학구도·단지 정보도 기관의 공고·갱신 시점에 따라 달라질 수 있습니다.",
  },
  {
    icon: ShieldCheck,
    title: "결정 전 공식 자료 확인",
    text: "AllView360은 비교와 탐색을 돕는 정보 서비스입니다. 계약·청약 등 중요한 결정 전에는 원본 공고와 관계 기관을 확인하세요.",
  },
];

export default function DataOperationsSection() {
  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold text-accent mb-2">DATA PRINCIPLES</p>
          <h2 className="text-3xl font-black text-gray-900 mb-3">AllView360 데이터는 어떻게 운영되나요?</h2>
          <p className="text-gray-600 leading-relaxed">
            직접 만든 공간 콘텐츠와 공공 공개자료를 구분해 보여드리며, 정보의 기준과 한계를 함께 안내합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-bg-card p-5">
              <span className="inline-flex p-2.5 rounded-xl bg-accent/10 text-accent mb-4">
                <Icon size={20} />
              </span>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{text}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          서비스별 데이터 출처와 이용 시 유의사항은 <Link href="/credits" className="text-accent font-semibold hover:underline">데이터 출처 안내</Link>에서 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
