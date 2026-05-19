"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { getVRUrl } from "@/lib/vrData";

type TypeStatus = "checking" | "available" | "unavailable";

interface Props {
  name: string;
  regionId: string;
  slug: string;
  types: string[];
  onClose: () => void;
}

export default function VRTypeSelector({ name, regionId, slug, types, onClose }: Props) {
  const [statuses, setStatuses] = useState<Record<string, TypeStatus>>(() =>
    Object.fromEntries(types.map((t) => [t, "checking" as TypeStatus]))
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    setStatuses(Object.fromEntries(types.map((t) => [t, "checking" as TypeStatus])));

    types.forEach(async (type) => {
      const url = getVRUrl(regionId, slug, type);
      try {
        const res = await fetch(`/api/vr-check?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        setStatuses((prev) => ({
          ...prev,
          [type]: data.exists ? "available" : "unavailable",
        }));
      } catch {
        setStatuses((prev) => ({ ...prev, [type]: "unavailable" }));
      }
    });
  }, [regionId, slug, types]);

  const handleTypeClick = useCallback(
    (type: string) => {
      window.open(getVRUrl(regionId, slug, type), "_blank", "noopener,noreferrer");
    },
    [regionId, slug]
  );

  const availableCount = Object.values(statuses).filter((s) => s === "available").length;
  const checking = Object.values(statuses).some((s) => s === "checking");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-base font-bold text-white">{name}</p>
            <p className="text-xs text-muted mt-0.5">
              {checking
                ? "평형 확인 중..."
                : `${availableCount}개 평형 이용 가능 · 선택하면 새 창에서 열립니다`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-bg-hover text-gray-400 hover:text-white transition-colors shrink-0 ml-3"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {types.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">평형 정보가 없습니다</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {types.map((type) => {
                const status = statuses[type];

                if (status === "checking") {
                  return (
                    <button
                      key={type}
                      disabled
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-bg-hover border border-border text-gray-500 cursor-wait"
                    >
                      <Loader2 size={10} className="animate-spin" />
                      {type}
                    </button>
                  );
                }

                if (status === "unavailable") {
                  return (
                    <button
                      key={type}
                      disabled
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-bg border border-border text-gray-600 cursor-not-allowed line-through"
                    >
                      {type}
                    </button>
                  );
                }

                return (
                  <button
                    key={type}
                    onClick={() => handleTypeClick(type)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all"
                  >
                    <ExternalLink size={10} />
                    {type}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
