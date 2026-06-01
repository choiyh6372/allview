"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ExternalLink, Move, Copy } from "lucide-react";
import { getVRUrl } from "@/lib/vrData";

const REGION_ID = "ocean";
const SLUG = "doosan";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "49":  { label: "49평", color: "#fff", bg: "#e87c7c", border: "#c45c5c" },
  "33c": { label: "33C", color: "#fff", bg: "#1ec8c8", border: "#0aa0a0" },
  "33d": { label: "33D", color: "#fff", bg: "#d946a8", border: "#b0308a" },
  "33b": { label: "33B", color: "#333", bg: "#f5e642", border: "#c8b800" },
  "33a": { label: "33A", color: "#333", bg: "#7be83a", border: "#4ab810" },
  "28":  { label: "28평", color: "#fff", bg: "#4a9eff", border: "#2070cc" },
};

type Hotspot = { id: number; type: string; x: number; y: number };

const INITIAL_HOTSPOTS: Hotspot[] = [
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
];

const STORAGE_KEY = "doosan-hotspots";

function loadHotspots(): Hotspot[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_HOTSPOTS;
}

export default function TestPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHotspots(loadHotspots());
    setMounted(true);
  }, []);
  const [editMode, setEditMode] = useState(false);
  const [vrUrl, setVrUrl] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; type: string } | null>(null);

  const imgRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<number | null>(null);
  const dragType = useRef<string | null>(null);

  function saveToStorage(spots: Hotspot[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function openVR(type: string) {
    if (editMode) return;
    setActiveType(type);
    setVrUrl(getVRUrl(REGION_ID, SLUG, type));
  }

  function closeVR() {
    setVrUrl(null);
    setActiveType(null);
  }

  const onMouseDown = useCallback((e: React.MouseEvent, id: number) => {
    if (!editMode) return;
    e.preventDefault();
    draggingId.current = id;

    const onMove = (me: MouseEvent) => {
      if (draggingId.current === null || !imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((me.clientY - rect.top) / rect.height) * 100));
      setHotspots(prev => prev.map(hs => hs.id === draggingId.current ? { ...hs, x, y } : hs));
    };
    const onUp = () => {
      draggingId.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      // 드래그 끝나면 현재 상태 그대로 저장
      setHotspots(prev => {
        saveToStorage(prev);
        return prev;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [editMode]);

  function exportCode() {
    const code = `const INITIAL_HOTSPOTS: Hotspot[] = [\n` +
      hotspots.map(hs =>
        `  { id: ${hs.id}, type: "${hs.type}", x: ${hs.x.toFixed(1)}, y: ${hs.y.toFixed(1)} },`
      ).join("\n") +
      `\n];`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doosan-hotspots.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetHotspots() {
    if (!confirm("처음 위치로 초기화할까요?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setHotspots(INITIAL_HOTSPOTS);
  }

  function deleteHotspot(id: number) {
    setHotspots(prev => {
      const updated = prev.filter(hs => hs.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }

  function onLegendDragStart(e: React.DragEvent, type: string) {
    dragType.current = type;
    e.dataTransfer.effectAllowed = "copy";
    // 기본 드래그 고스트(큰 버튼) 숨기기 → 투명 1×1 캔버스로 대체
    const canvas = document.createElement("canvas");
    canvas.width = 1; canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  }

  function onImageDragOver(e: React.DragEvent) {
    if (!editMode || !dragType.current || !imgRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setDragPreview({ x, y, type: dragType.current });
  }

  function onImageDragLeave() {
    setDragPreview(null);
  }

  function onImageDrop(e: React.DragEvent) {
    if (!editMode || !dragType.current || !imgRef.current) return;
    e.preventDefault();
    setDragPreview(null);
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    const newId = Math.max(0, ...hotspots.map(h => h.id)) + 1;
    const type = dragType.current;
    dragType.current = null;
    setHotspots(prev => {
      const updated = [...prev, { id: newId, type, x, y }];
      saveToStorage(updated);
      return updated;
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h1 className="text-white text-xl font-bold">두산위브 포세이돈 — VR 테스트</h1>
        <button
          onClick={() => setEditMode(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            editMode ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <Move size={14} />
          {editMode ? "편집 중 (완료)" : "핫스팟 편집"}
        </button>
        {editMode && (
          <>
            {saved && <span className="text-green-400 text-xs">✓ 저장됨</span>}
            <button
              onClick={exportCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-700 text-white hover:bg-blue-600"
            >
              <Copy size={14} />
              txt 파일 저장
            </button>
            <button
              onClick={resetHotspots}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-400 hover:bg-gray-600"
            >
              초기화
            </button>
          </>
        )}
      </div>

      {editMode && (
        <p className="text-orange-300 text-xs mb-3">
          ● 위 타입 버튼을 드래그 → 배치도에 놓기 (핫스팟 추가) &nbsp;|&nbsp; 핫스팟 드래그 → 위치 조정 &nbsp;|&nbsp; 우클릭 → 삭제
        </p>
      )}

      {/* 범례 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <button
            key={type}
            draggable={editMode}
            onDragStart={(e) => onLegendDragStart(e, type)}
            onClick={() => !editMode && openVR(type)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `2px solid ${cfg.border}`,
              cursor: editMode ? "grab" : "pointer",
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* 평면도 + 핫스팟 */}
      <div
        ref={imgRef}
        className="relative inline-block max-w-full"
        onDragOver={onImageDragOver}
        onDragLeave={onImageDragLeave}
        onDrop={onImageDrop}
        style={{ cursor: editMode && dragPreview ? "crosshair" : "default" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/apt_map/ocean/doosan.jpg"
          alt="두산위브 포세이돈 단지 배치도"
          className="block max-w-full rounded-lg select-none"
          style={{ maxHeight: "70vh" }}
          draggable={false}
        />

        {/* 드래그 미리보기 */}
        {dragPreview && (() => {
          const cfg = TYPE_CONFIG[dragPreview.type];
          return (
            <div
              className="absolute pointer-events-none rounded-full flex items-center justify-center text-[9px] font-bold shadow-lg"
              style={{
                left: `${dragPreview.x}%`,
                top: `${dragPreview.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28, height: 28,
                background: cfg.bg,
                color: cfg.color,
                border: `2px solid ${cfg.border}`,
                opacity: 0.85,
                zIndex: 20,
              }}
            >
              {cfg.label.replace("평", "")}
            </div>
          );
        })()}

        {mounted && hotspots.map((hs) => {
          const cfg = TYPE_CONFIG[hs.type];
          return (
            <button
              key={hs.id}
              data-hotspot="true"
              onMouseDown={(e) => onMouseDown(e, hs.id)}
              onContextMenu={(e) => { e.preventDefault(); if (editMode) deleteHotspot(hs.id); }}
              onClick={(e) => { e.stopPropagation(); if (!editMode) openVR(hs.type); }}
              title={editMode ? `${cfg.label} — 드래그: 이동, 우클릭: 삭제` : `${cfg.label} VR 보기`}
              className="absolute rounded-full transition-all hover:opacity-60"
              style={{
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28,
                height: 28,
                background: editMode ? cfg.bg : "transparent",
                border: editMode ? `2px solid ${cfg.border}` : "none",
                zIndex: 10,
                cursor: editMode ? "grab" : "pointer",
                outline: editMode ? "2px solid rgba(255,165,0,0.6)" : "none",
              }}
            >
              {""}
            </button>
          );
        })}
      </div>

      {/* VR 모달 */}
      {vrUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) closeVR(); }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 shrink-0">
            <span className="text-white font-semibold">
              두산위브 포세이돈 &nbsp;
              <span className="text-cyan-400">
                {activeType ? TYPE_CONFIG[activeType]?.label ?? activeType.toUpperCase() : ""}
              </span>
              &nbsp;VR 투어
            </span>
            <div className="flex items-center gap-2">
              <a
                href={vrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:text-white text-xs"
              >
                <ExternalLink size={12} /> 새 탭
              </a>
              <button onClick={closeVR} className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>
          <iframe
            key={vrUrl}
            src={vrUrl}
            className="flex-1 w-full"
            allowFullScreen
            allow="xr-spatial-tracking"
            title="VR 투어"
          />
        </div>
      )}
    </div>
  );
}
