"use client";

import { useState } from "react";
import { Building2, Play } from "lucide-react";
import { VRComplex, R2_BASE } from "@/lib/vrData";

interface Props {
  complex: VRComplex;
  onSelect: () => void;
}

export default function ComplexCard({ complex, onSelect }: Props) {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = `${R2_BASE}/${complex.regionId}/${complex.slug}/thumb.jpg`;

  return (
    <div className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-36 bg-gradient-to-br from-bg-hover to-bg flex items-center justify-center">
        {imgError ? (
          <Building2 size={40} className="text-border" />
        ) : (
          <img
            src={thumbUrl}
            alt={complex.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        <button
          onClick={onSelect}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-white text-sm font-semibold">
            <Play size={14} fill="white" /> 투어 보기
          </span>
        </button>
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-bg/80 backdrop-blur rounded-lg text-xs text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          LIVE VR
        </span>
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">
          {complex.regionName}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">{complex.name}</h3>
          <span className="text-xs text-gray-500">{complex.types.length}개 평형</span>
        </div>
        <button
          onClick={onSelect}
          className="w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent rounded-xl text-xs font-semibold transition-all"
        >
          평형 선택 후 VR 시작
        </button>
      </div>
    </div>
  );
}
