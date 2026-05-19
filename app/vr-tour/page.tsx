"use client";

import { useState } from "react";
import { complexData, VRComplex } from "@/lib/vrData";
import ComplexCard from "@/components/vr-tour/ComplexCard";
import VRModal from "@/components/vr-tour/VRModal";
import StoreBanner from "@/components/home/StoreBanner";

const regions = ["전체", "오션시티", "국제신도시"];

export default function VRTourPage() {
  const [region, setRegion] = useState("전체");
  const [selected, setSelected] = useState<VRComplex | null>(null);

  const filtered =
    region === "전체"
      ? complexData
      : complexData.filter((c) => c.regionName === region);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2">VR 가상투어</h1>
          <p className="text-gray-400">단지를 선택한 후 평형을 고르면 360° VR 투어를 바로 시작할 수 있습니다.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                region === r
                  ? "bg-accent text-white"
                  : "bg-bg-card border border-border text-gray-400 hover:text-white hover:border-accent/40"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <ComplexCard key={c.id} complex={c} onSelect={() => setSelected(c)} />
          ))}
        </div>
      </div>

      <StoreBanner />

      {selected && <VRModal complex={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
