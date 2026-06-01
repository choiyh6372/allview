"use client";

import { useState, useEffect, useRef } from "react";
import { complexData, VRComplex, getVRUrl } from "@/lib/vrData";
import StoreBanner from "@/components/home/StoreBanner";
import { VR_AREA_MAP } from "@/lib/vrAreaMapping";
import { Building2, ChevronLeft } from "lucide-react";

// ── 타입별 색상 ──
const TYPE_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  "49":  { bg: "#e87c7c", border: "#c45c5c", text: "#fff" },
  "33a": { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "33b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
  "33c": { bg: "#1ec8c8", border: "#0aa0a0", text: "#fff" },
  "33d": { bg: "#d946a8", border: "#b0308a", text: "#fff" },
  "28":  { bg: "#4a9eff", border: "#2070cc", text: "#fff" },
};
function typeColor(type: string) {
  return TYPE_COLOR[type] ?? { bg: "#888", border: "#555", text: "#fff" };
}

// ── 배치도 + 핫스팟 데이터 ──
type Hotspot = { id: number; type: string; x: number; y: number };

const FLOOR_PLAN_DATA: Record<string, { image: string; hotspots: Hotspot[] }> = {
  ocean_doosan: {
    image: "/apt_map/ocean/doosan.jpg",
    hotspots: [
      { id: 0, type: "49", x: 7.4, y: 10.4 },
      { id: 1, type: "33c", x: 13.4, y: 11.0 },
      { id: 2, type: "33d", x: 18.5, y: 12.0 },
      { id: 3, type: "33b", x: 27.7, y: 10.8 },
      { id: 4, type: "33b", x: 35.7, y: 10.4 },
      { id: 5, type: "33a", x: 26.9, y: 18.7 },
      { id: 6, type: "33a", x: 20.7, y: 18.1 },
      { id: 7, type: "33c", x: 56.6, y: 13.1 },
      { id: 11, type: "33a", x: 87.8, y: 18.9 },
      { id: 12, type: "33a", x: 93.4, y: 18.1 },
      { id: 13, type: "28", x: 84.7, y: 12.7 },
      { id: 14, type: "49", x: 8.7, y: 35.7 },
      { id: 15, type: "33c", x: 13.6, y: 35.7 },
      { id: 16, type: "33d", x: 18.5, y: 37.3 },
      { id: 17, type: "33b", x: 36.8, y: 35.9 },
      { id: 18, type: "33b", x: 28.6, y: 36.3 },
      { id: 19, type: "33a", x: 21.0, y: 43.4 },
      { id: 20, type: "33a", x: 26.9, y: 43.6 },
      { id: 21, type: "33c", x: 50.5, y: 35.2 },
      { id: 22, type: "33c", x: 57.2, y: 38.1 },
      { id: 23, type: "33b", x: 66.2, y: 37.2 },
      { id: 26, type: "33a", x: 92.9, y: 42.7 },
      { id: 27, type: "28", x: 85.0, y: 37.5 },
      { id: 28, type: "49", x: 8.7, y: 59.8 },
      { id: 29, type: "33c", x: 14.2, y: 60.3 },
      { id: 30, type: "33d", x: 19.5, y: 61.2 },
      { id: 31, type: "33b", x: 37.1, y: 61.6 },
      { id: 32, type: "33b", x: 28.4, y: 61.0 },
      { id: 33, type: "33a", x: 21.0, y: 67.5 },
      { id: 34, type: "33a", x: 26.3, y: 68.4 },
      { id: 35, type: "33c", x: 74.8, y: 60.7 },
      { id: 36, type: "33c", x: 80.5, y: 60.9 },
      { id: 37, type: "33b", x: 54.7, y: 61.4 },
      { id: 38, type: "33b", x: 44.7, y: 60.3 },
      { id: 39, type: "33a", x: 61.7, y: 68.2 },
      { id: 40, type: "33a", x: 56.4, y: 67.7 },
      { id: 41, type: "28", x: 84.9, y: 62.5 },
      { id: 42, type: "49", x: 8.5, y: 85.3 },
      { id: 43, type: "33c", x: 14.2, y: 85.3 },
      { id: 44, type: "33d", x: 19.5, y: 86.5 },
      { id: 45, type: "33b", x: 36.8, y: 85.6 },
      { id: 46, type: "33b", x: 28.7, y: 86.2 },
      { id: 47, type: "33a", x: 38.2, y: 92.5 },
      { id: 48, type: "33a", x: 44.0, y: 92.6 },
      { id: 49, type: "33c", x: 75.4, y: 85.5 },
      { id: 50, type: "33c", x: 81.3, y: 85.1 },
      { id: 51, type: "33b", x: 66.8, y: 86.0 },
      { id: 52, type: "33b", x: 94.7, y: 85.5 },
      { id: 53, type: "33a", x: 87.8, y: 92.5 },
      { id: 54, type: "33a", x: 93.4, y: 92.6 },
      { id: 55, type: "28", x: 85.5, y: 86.7 },
      { id: 56, type: "33a", x: 37.6, y: 17.1 },
      { id: 57, type: "33a", x: 42.8, y: 17.2 },
      { id: 58, type: "33b", x: 44.7, y: 10.4 },
      { id: 59, type: "33c", x: 51.0, y: 9.2 },
      { id: 60, type: "33a", x: 59.5, y: 17.4 },
      { id: 61, type: "33a", x: 64.5, y: 17.6 },
      { id: 62, type: "33b", x: 66.3, y: 12.4 },
      { id: 63, type: "33a", x: 87.8, y: 43.1 },
      { id: 64, type: "33a", x: 26.3, y: 92.8 },
      { id: 65, type: "33a", x: 21.8, y: 92.8 },
      { id: 66, type: "33a", x: 59.5, y: 91.2 },
      { id: 67, type: "33a", x: 64.6, y: 91.4 },
      { id: 68, type: "28", x: 58.3, y: 86.5 },
      { id: 69, type: "28", x: 55.0, y: 82.2 },
      { id: 70, type: "28", x: 63.2, y: 61.2 },
      { id: 71, type: "28", x: 66.5, y: 57.6 },
      { id: 72, type: "33a", x: 59.5, y: 43.1 },
      { id: 73, type: "33a", x: 64.9, y: 42.7 },
      { id: 74, type: "33a", x: 43.4, y: 41.5 },
      { id: 75, type: "33a", x: 38.2, y: 42.7 },
      { id: 76, type: "33a", x: 43.1, y: 67.3 },
      { id: 77, type: "33a", x: 37.6, y: 67.9 },
      { id: 78, type: "33c", x: 74.8, y: 35.0 },
      { id: 79, type: "33c", x: 80.4, y: 35.2 },
      { id: 80, type: "33c", x: 75.0, y: 9.9 },
      { id: 81, type: "33c", x: 80.4, y: 9.9 },
      { id: 82, type: "33b", x: 94.3, y: 11.0 },
      { id: 83, type: "33b", x: 45.0, y: 85.5 },
      { id: 84, type: "33b", x: 44.4, y: 35.4 },
    ],
  },
};

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

// ── 배치도 뷰 ──
function FloorPlanView({ complex, onBack }: { complex: VRComplex; onBack: () => void }) {
  const key = `${complex.regionId}_${complex.slug}`;
  const plan = FLOOR_PLAN_DATA[key];
  const areaMap = VR_AREA_MAP[key] ?? {};
  const imgRef = useRef<HTMLDivElement>(null);
  if (!plan) {
    // 배치도 없는 단지 → 기존 타입 버튼 방식
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6">
          <ChevronLeft size={16} /> 목록으로
        </button>
        <h2 className="text-white text-xl font-bold mb-2">{complex.name}</h2>
        <p className="text-gray-500 text-sm mb-6">배치도 준비 중입니다. 평형을 직접 선택하세요.</p>
        <div className="flex flex-wrap gap-2">
          {complex.types.map((type) => {
            const sqm = areaMap[type];
            const cfg = typeColor(type);
            return (
              <button key={type} onClick={() => window.open(getVRUrl(complex.regionId, complex.slug, type), "_blank")}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: cfg.bg, color: cfg.text, border: `2px solid ${cfg.border}` }}>
                {type.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4">
        <ChevronLeft size={16} /> 목록으로
      </button>

      <div className="text-center mb-6">
        <h2 className="text-white text-3xl font-bold mb-1">{complex.name}</h2>
        <p className="text-gray-400 text-sm">배치도에서 해당 면적을 누르면 VR로 연결됩니다.</p>
      </div>

      <div className="flex justify-center">
        <div ref={imgRef} className="relative w-full max-w-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={plan.image}
            alt={`${complex.name} 단지 배치도`}
            className="block w-full rounded-xl"
            draggable={false}
          />
          {plan.hotspots.map((hs) => (
            <button
              key={hs.id}
              onClick={() => window.open(getVRUrl(complex.regionId, complex.slug, hs.type), "_blank")}
              title={`${hs.type.toUpperCase()} VR 보기`}
              className="absolute rounded-full hover:opacity-70 transition-opacity"
              style={{
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28,
                height: 28,
                background: "transparent",
                border: "none",
                zIndex: 10,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 단지 카드 ──
function ComplexCard({ complex, onSelect }: { complex: VRComplex; onSelect: () => void }) {
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
          <h3 className="text-sm font-bold text-white">{complex.name}</h3>
          <span className="text-xs text-green-400">{complex.types.length}개 평형</span>
        </div>
        <button onClick={onSelect}
          className="w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent rounded-xl text-xs font-semibold transition-all">
          배치도 · VR 보기
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──
export default function VRTestPage() {
  const [region, setRegion] = useState("명지오션시티");
  const [selected, setSelected] = useState<VRComplex | null>(null);

  const filtered = complexData.filter((c) => c.regionName === region);

  if (selected) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FloorPlanView complex={selected} onBack={() => setSelected(null)} />
        </div>
        <StoreBanner />
      </>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">VR 가상투어</h1>
        <p className="text-gray-400">단지 배치도에서 원하는 면적을 클릭하면 VR 투어가 시작됩니다.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {regions.map((r) => (
          <button key={r} onClick={() => setRegion(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              region === r ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-400 hover:text-white hover:border-accent/40"
            }`}>
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
    </>
  );
}
