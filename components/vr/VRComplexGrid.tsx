"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { VRComplex } from "@/lib/vrData";
import { FLOOR_PLAN_DATA } from "@/components/vr/FloorPlanView";

function ComplexCard({ complex, vrCount }: { complex: VRComplex; vrCount?: number }) {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = `https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/${complex.regionId}/${complex.slug}/thumb.jpg`;
  const hasPlan = !!FLOOR_PLAN_DATA[`${complex.regionId}_${complex.slug}`];
  const hasVR = !complex.noVR;
  const href = `/vr-tour/${complex.regionId}/${complex.slug}`;

  return (
    <div className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-44 bg-gradient-to-br from-bg-hover to-bg flex items-center justify-center">
        {imgError ? (
          <Building2 size={40} className="text-border" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={complex.name} className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)} />
        )}
        <Link href={href} aria-label={`${complex.name} 배치도 보기`} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-white text-sm font-semibold">
            배치도 보기
          </span>
        </Link>
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur rounded-lg text-xs text-white font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${hasVR ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} /> {hasVR ? "LIVE VR" : "평면도"}
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
          <span className="text-xs text-green-600">{hasVR && vrCount !== undefined ? `${vrCount} / ${complex.types.length}개 평형` : `${complex.types.length}개 평형`}</span>
        </div>
        <Link href={href}
          className="block text-center w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent rounded-xl text-xs font-semibold transition-all">
          {hasVR ? "배치도 · VR 보기" : "배치도 · 평면도 보기"}
        </Link>
      </div>
    </div>
  );
}

/** VR 단지 카드 목록. 평형별 VR 개수만 브라우저에서 불러오고, 카드·링크는 서버 HTML에 그대로 들어간다. */
export default function VRComplexGrid({ complexes }: { complexes: VRComplex[] }) {
  const [vrCounts, setVRCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/vr-counts", { cache: "no-store" })
      .then((r) => r.json())
      .then(setVRCounts)
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {complexes.map((c) => (
        <ComplexCard key={c.id} complex={c} vrCount={vrCounts[c.id]} />
      ))}
    </div>
  );
}
