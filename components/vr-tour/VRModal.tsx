"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { VRComplex, getVRUrl } from "@/lib/vrData";
import { VR_AREA_MAP } from "@/lib/vrAreaMapping";

type TypeStatus = "checking" | "available" | "unavailable";

function sortAreaTypes(types: string[]): string[] {
  return [...types].sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (numA !== numB) return numA - numB;
    return a.replace(/^\d+/, "").localeCompare(b.replace(/^\d+/, ""));
  });
}

interface Props {
  complex: VRComplex;
  onClose: () => void;
}

export default function VRModal({ complex, onClose }: Props) {
  const complexKey = `${complex.regionId}_${complex.slug}`;
  const areaMap = VR_AREA_MAP[complexKey] ?? {};
  const allTypes = sortAreaTypes(Object.keys(areaMap));

  const [typeStatuses, setTypeStatuses] = useState<Record<string, TypeStatus>>(() =>
    Object.fromEntries(allTypes.map((t) => [t, "checking" as TypeStatus]))
  );
  const [activeVRUrl, setActiveVRUrl] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    window.history.pushState({ vrModal: true }, "");
    const onPopState = () => onClose();
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.removeEventListener("popstate", onPopState);
    };
  }, [onClose]);

  useEffect(() => {
    const types = Object.keys(VR_AREA_MAP[complexKey] ?? {});

    setTypeStatuses(Object.fromEntries(types.map((t) => [t, "checking" as TypeStatus])));
    setActiveVRUrl(null);
    setActiveType(null);

    let cancelled = false;
    types.forEach(async (type) => {
      const url = getVRUrl(complex.regionId, complex.slug, type);
      try {
        const res = await fetch(`/api/vr-check?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (!cancelled)
          setTypeStatuses((prev) => ({
            ...prev,
            [type]: data.exists ? "available" : "unavailable",
          }));
      } catch {
        if (!cancelled)
          setTypeStatuses((prev) => ({ ...prev, [type]: "unavailable" }));
      }
    });

    return () => { cancelled = true; };
  // complexKey(문자열)을 의존성으로 써서 toVRComplex 새 객체 참조에 의한 루프 방지
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complexKey]);

  const handleTypeClick = useCallback(
    (type: string) => {
      setActiveType(type);
      setActiveVRUrl(getVRUrl(complex.regionId, complex.slug, type));
    },
    [complex]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[92vw] max-w-6xl h-[92vh] bg-bg-card border border-border rounded-2xl overflow-hidden flex flex-col">

        {/* 상단: 단지명 / 평형 / 지역 */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base font-bold text-white truncate">{complex.name}</span>
            {activeType ? (
              <span className="text-sm font-semibold text-accent shrink-0">{activeType.toUpperCase()}</span>
            ) : (
              <span className="text-sm text-muted shrink-0">평형 선택</span>
            )}
            <span className="text-sm text-muted shrink-0">· {complex.regionName}</span>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {activeVRUrl && (
              <a
                href={activeVRUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-hover rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={12} />
                새 탭으로
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-bg-hover text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 평형 버튼들 */}
        <div className="px-6 py-3 border-b border-border shrink-0 flex flex-wrap gap-2 max-h-24 overflow-y-auto md:max-h-none md:overflow-visible scrollbar-light">
          {allTypes.map((type) => {
            const status = typeStatuses[type];
            const sqm = areaMap[type];
            const display = type.toUpperCase();
            const label = sqm ? `${display} (${sqm}㎡)` : display;
            const isChecking = status === "checking";
            const isUnavailable = status === "unavailable";

            return (
              <button
                key={type}
                disabled={isChecking || isUnavailable}
                onClick={isChecking || isUnavailable ? undefined : () => handleTypeClick(type)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  isChecking
                    ? "bg-bg-hover border border-border text-gray-500 cursor-wait"
                    : isUnavailable
                    ? "bg-bg border border-border text-gray-600 cursor-not-allowed line-through"
                    : activeType === type
                    ? "bg-accent text-white border border-accent"
                    : "bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-white"
                }`}
              >
                {/* 스피너 자리를 항상 고정 크기로 예약해 로딩 전후 버튼 크기 유지 */}
                <span className="w-[10px] shrink-0 flex justify-center">
                  {isChecking && <Loader2 size={10} className="animate-spin" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {/* VR iframe — 나머지 전체 */}
        <div className="flex-1 relative bg-bg min-h-0">
          {activeVRUrl ? (
            <iframe
              key={activeVRUrl}
              src={activeVRUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="xr-spatial-tracking"
              title={`${complex.name} ${activeType} VR 투어`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
              <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                  <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                </svg>
              </div>
              <p className="text-sm">위에서 평형을 선택하면 VR 투어가 시작됩니다</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
