"use client";

import { useState, useEffect } from "react";
import { complexData, VRComplex } from "@/lib/vrData";
import StoreBanner from "@/components/home/StoreBanner";
import { Building2 } from "lucide-react";
import { FLOOR_PLAN_DATA } from "@/components/vr/FloorPlanView";
import { useRouter } from "next/navigation";

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

function ComplexCard({ complex, vrCount, onSelect }: { complex: VRComplex; vrCount?: number; onSelect: () => void }) {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = `https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/${complex.regionId}/${complex.slug}/thumb.jpg`;
  const hasPlan = !!FLOOR_PLAN_DATA[`${complex.regionId}_${complex.slug}`];

  return (
    <div className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-36 bg-gradient-to-br from-bg-hover to-bg flex items-center justify-center">
        {imgError ? (
          <Building2 size={40} className="text-border" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={complex.name} className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)} />
        )}
        <button onClick={onSelect} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-white text-sm font-semibold">
            배치도 보기
          </span>
        </button>
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur rounded-lg text-xs text-white font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE VR
        </span>
        {hasPlan && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-medium">
            배치도
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">{complex.name}</h3>
          <span className="text-xs text-green-600">{vrCount !== undefined ? `${vrCount} / ${complex.types.length}개 평형` : `${complex.types.length}개 평형`}</span>
        </div>
        <button onClick={onSelect}
          className="w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent rounded-xl text-xs font-semibold transition-all">
          배치도 · VR 보기
        </button>
      </div>
    </div>
  );
}

export default function VRTourPage() {
  const router = useRouter();
  const [region, setRegion] = useState("명지오션시티");
  const [vrCounts, setVRCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/vr-counts", { cache: "no-store" })
      .then((r) => r.json())
      .then(setVRCounts)
      .catch(() => {});
  }, []);

  const filtered = complexData.filter((c) => c.regionName === region);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">VR 가상투어</h1>
          <p className="text-gray-600">단지 배치도에서 원하는 면적을 클릭하면 VR 투어가 시작됩니다.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {regions.map((r) => (
            <button key={r} onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                region === r ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40"
              }`}>
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <ComplexCard
              key={c.id}
              complex={c}
              vrCount={vrCounts[c.id]}
              onSelect={() => router.push(`/vr-tour/${c.regionId}/${c.slug}`)}
            />
          ))}
        </div>
      </div>
      <StoreBanner />
    </>
  );
}
