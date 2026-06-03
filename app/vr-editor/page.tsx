"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Trash2, Undo2, Copy, Check, ChevronDown, Download } from "lucide-react";
import { complexData } from "@/lib/vrData";

const OCEAN_COMPLEXES = complexData.filter((c) => c.regionId === "ocean");
const KUKJE_COMPLEXES = complexData.filter((c) => c.regionId === "kukje");
const ECODELTA_COMPLEXES = complexData.filter((c) => c.regionId === "ecodelta");

const PALETTE = [
  { bg: "#e87c7c", border: "#c45c5c", text: "#fff" },
  { bg: "#7be83a", border: "#4ab810", text: "#333" },
  { bg: "#f5e642", border: "#c8b800", text: "#333" },
  { bg: "#1ec8c8", border: "#0aa0a0", text: "#fff" },
  { bg: "#d946a8", border: "#b0308a", text: "#fff" },
  { bg: "#4a9eff", border: "#2070cc", text: "#fff" },
  { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  { bg: "#e74c3c", border: "#c0392b", text: "#fff" },
  { bg: "#3498db", border: "#2176ae", text: "#fff" },
  { bg: "#f39c12", border: "#c87d0e", text: "#fff" },
  { bg: "#1abc9c", border: "#148f77", text: "#fff" },
  { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
  { bg: "#27ae60", border: "#1e8449", text: "#fff" },
  { bg: "#e67e22", border: "#b7601a", text: "#fff" },
  { bg: "#16a085", border: "#117a65", text: "#fff" },
  { bg: "#c0392b", border: "#922b21", text: "#fff" },
  { bg: "#2980b9", border: "#1f618d", text: "#fff" },
  { bg: "#7f8c8d", border: "#616a6b", text: "#fff" },
];

type Hotspot = { id: number; type: string; x: number; y: number };
type AllHotspots = Record<string, Hotspot[]>;

const COMPLEX_IMAGE: Record<string, string> = {
  ocean_blueocean4: "/apt_map/ocean/blueocean4.jpg",
  ocean_blueocean5: "/apt_map/ocean/blueocean5.jpg",
  ocean_blueocean6: "/apt_map/ocean/blueocean6.jpg",
  ocean_doosan: "/apt_map/ocean/doosan.jpg",
  ocean_hansin: "/apt_map/ocean/hansin.jpg",
  ocean_kukdong: "/apt_map/ocean/kukdong.jpg",
  ocean_lotte: "/apt_map/ocean/lotte.jpg",
  ocean_qweendom_edison: "/apt_map/ocean/qweendom_edison.jpg",
  ocean_qweendom_lincoln: "/apt_map/ocean/qweendom_lincoln.jpg",
  ocean_qweendom_einstein: "/apt_map/ocean/qweendom_einstein.jpg",
  ocean_samjung: "/apt_map/ocean/samjung.jpg",
  ocean_solmare: "/apt_map/ocean/solmare.jpg",
  kukje_daebang1: "/apt_map/kukje/daebang1.jpg",
  kukje_daebang2: "/apt_map/kukje/darbang2.jpg",
  kukje_eileen: "/apt_map/kukje/eileen.jpg",
  kukje_elife: "/apt_map/kukje/elife.jpg",
  kukje_hoban1: "/apt_map/kukje/hoban1.jpg",
  kukje_hoban2: "/apt_map/kukje/hoban2.jpg",
  kukje_hyupsung: "/apt_map/kukje/hyupsung.jpg",
  kukje_jungheung1: "/apt_map/kukje/jungheung1.jpg",
  kukje_jungheung2: "/apt_map/kukje/jungheung2.jpg",
  kukje_kumkang1: "/apt_map/kukje/kumkang1.jpg",
  kukje_kumkang2: "/apt_map/kukje/kumkang2.jpg",
  kukje_kumkang3: "/apt_map/kukje/kumkang3.jpg",
  kukje_thehill: "/apt_map/kukje/thehill.jpg",
  kukje_samjung: "/apt_map/kukje/samjung.jpg",
  kukje_posco2: "/apt_map/kukje/posco2.jpg",
  kukje_thewestern: "/apt_map/kukje/thewestern.jpg",
  kukje_posco3: "/apt_map/kukje/posco3.jpg",
  ecodelta_hoban: "/apt_map/ecodelta/호반써밋 단지.jpg",
  ecodelta_sujain: "/apt_map/ecodelta/수자인.jpg",
  ecodelta_prugio_lin: "/apt_map/ecodelta/푸르지오린.jpg",
  ecodelta_xi: "/apt_map/ecodelta/강서자이.jpg",
  ecodelta_elife: "/apt_map/ecodelta/이편한센터포인트.jpg",
  ecodelta_prugio_center: "/apt_map/ecodelta/푸르지오센터파크단지.jpg",
  ecodelta_theberhill: "/apt_map/ecodelta/대성베르힐.jpg",
  ecodelta_jungheung: "/apt_map/ecodelta/중흥s클래스에듀리버.jpg",
  ecodelta_dietr_grand: "/apt_map/ecodelta/대방 그랑루체.jpg",
  ecodelta_dietr_first: "/apt_map/ecodelta/대방디에트르더퍼스트.jpg",
  ecodelta_jungheung2: "/apt_map/ecodelta/중흥에코델타시티.jpg",
  ecodelta_elium: "/apt_map/ecodelta/대방엘리움리버뷰저장.jpg",
};

export default function VREditorPage() {
  const [region, setRegion] = useState<"ocean" | "kukje" | "ecodelta">("ocean");
  const [complexId, setComplexId] = useState("ocean_doosan");
  const [allHotspots, setAllHotspots] = useState<AllHotspots>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [mode, setMode] = useState<"place" | "pan">("place");
  const [nextId, setNextId] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const CURRENT_COMPLEXES = region === "ocean" ? OCEAN_COMPLEXES : region === "kukje" ? KUKJE_COMPLEXES : ECODELTA_COMPLEXES;
  const complex = CURRENT_COMPLEXES.find((c) => c.id === complexId) ?? CURRENT_COMPLEXES[0]!;
  const hotspots: Hotspot[] = allHotspots[complexId] ?? [];

  const typeColorMap = useMemo(() => {
    const map: Record<string, (typeof PALETTE)[0]> = {};
    complex.types.forEach((t, i) => {
      map[t] = PALETTE[i % PALETTE.length];
    });
    return map;
  }, [complex]);

  function switchRegion(r: "ocean" | "kukje" | "ecodelta") {
    setRegion(r);
    const list = r === "ocean" ? OCEAN_COMPLEXES : r === "kukje" ? KUKJE_COMPLEXES : ECODELTA_COMPLEXES;
    setComplexId(list[0].id);
  }

  useEffect(() => {
    if (complex.types.length > 0 && !complex.types.includes(selectedType)) {
      setSelectedType(complex.types[0]);
    }
  }, [complexId, complex.types, selectedType]);

  // localStorage 초기 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vr-editor-hotspots");
      if (saved) {
        const data = JSON.parse(saved) as AllHotspots;
        setAllHotspots(data);
        const maxId = Object.values(data).flat().reduce((m, h) => Math.max(m, h.id), -1);
        setNextId(maxId + 1);
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // localStorage 자동 저장 (로드 완료 후에만)
  useEffect(() => {
    if (!isLoaded) return;
    try { localStorage.setItem("vr-editor-hotspots", JSON.stringify(allHotspots)); } catch {}
  }, [allHotspots, isLoaded]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        setAllHotspots((prev) => {
          const current = prev[complexId] ?? [];
          return { ...prev, [complexId]: current.slice(0, -1) };
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [complexId]);

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (mode !== "place" || !selectedType) return;
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
    const id = nextId;
    setNextId((n) => n + 1);
    setAllHotspots((prev) => ({
      ...prev,
      [complexId]: [...(prev[complexId] ?? []), { id, type: selectedType, x, y }],
    }));
  }

  function removeHotspot(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setAllHotspots((prev) => ({
      ...prev,
      [complexId]: (prev[complexId] ?? []).filter((h) => h.id !== id),
    }));
  }

  function getComplexCode(cid: string) {
    const hs = allHotspots[cid] ?? [];
    const imgPath = COMPLEX_IMAGE[cid] ?? "";
    const lines = hs.map((h) => `      { id: ${h.id}, type: "${h.type}", x: ${h.x}, y: ${h.y} },`);
    return `  ${cid}: {\n    image: "${imgPath}",\n    hotspots: [\n${lines.join("\n")}\n    ],\n  },`;
  }

  function getAllCode() {
    const doneIds = Object.keys(allHotspots).filter((k) => (allHotspots[k]?.length ?? 0) > 0);
    if (doneIds.length === 0) return "// 아직 핫스팟이 없습니다.";
    return `const FLOOR_PLAN_DATA = {\n${doneIds.map(getComplexCode).join("\n")}\n};`;
  }

  async function copyCurrent() {
    await navigator.clipboard.writeText(getComplexCode(complexId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(getAllCode());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function saveAsText() {
    const blob = new Blob([JSON.stringify(allHotspots, null, 2)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hotspots.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AllHotspots;
        setAllHotspots(data);
        // nextId를 기존 id 중 최댓값+1로 설정
        const maxId = Object.values(data).flat().reduce((m, h) => Math.max(m, h.id), -1);
        setNextId(maxId + 1);
        alert("불러오기 완료!");
      } catch {
        alert("파일 형식이 올바르지 않습니다.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    hotspots.forEach((h) => { counts[h.type] = (counts[h.type] ?? 0) + 1; });
    return counts;
  }, [hotspots]);

  const doneCount = Object.keys(allHotspots).filter((k) => (allHotspots[k]?.length ?? 0) > 0).length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-black text-gray-900">배치도 핫스팟 에디터</h1>

        {/* Region tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => switchRegion("ocean")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${region === "ocean" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            오션시티
          </button>
          <button onClick={() => switchRegion("kukje")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${region === "kukje" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            국제신도시
          </button>
          <button onClick={() => switchRegion("ecodelta")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${region === "ecodelta" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            에코델타
          </button>
        </div>
        <span className="text-xs text-gray-400">({doneCount}/{CURRENT_COMPLEXES.length} 완료)</span>

        {/* Complex selector */}
        <div className="relative ml-2">
          <select
            value={complexId}
            onChange={(e) => setComplexId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {CURRENT_COMPLEXES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {(allHotspots[c.id]?.length ?? 0) > 0 ? `(${allHotspots[c.id].length}개)` : ""}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 ml-4 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode("place")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === "place" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ✏️ 배치 모드
          </button>
          <button
            onClick={() => setMode("pan")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === "pan" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🖐 이동 모드
          </button>
        </div>

        {/* Undo / clear */}
        <button
          onClick={() => setAllHotspots((prev) => ({ ...prev, [complexId]: (prev[complexId] ?? []).slice(0, -1) }))}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs"
        >
          <Undo2 size={13} /> 취소
        </button>
        <button
          onClick={() => setAllHotspots((prev) => ({ ...prev, [complexId]: [] }))}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs"
        >
          <Trash2 size={13} /> 이 단지 초기화
        </button>

        <span className="text-xs font-semibold text-gray-600 ml-auto">
          핫스팟 {hotspots.length}개
        </span>

        {/* Copy buttons */}
        <button
          onClick={copyCurrent}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            copied ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {copied ? <><Check size={12} /> 복사됨!</> : <><Copy size={12} /> 현재 단지 복사</>}
        </button>
        <button
          onClick={copyAll}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            copiedAll ? "bg-green-500 text-white" : "bg-purple-500 hover:bg-purple-600 text-white"
          }`}
        >
          {copiedAll ? <><Check size={12} /> 복사됨!</> : <><Copy size={12} /> 전체 복사</>}
        </button>
        <button
          onClick={saveAsText}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-800 text-white"
        >
          <Download size={12} /> 저장
        </button>
        <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-500 hover:bg-gray-600 text-white cursor-pointer">
          <Download size={12} className="rotate-180" /> 불러오기
          <input type="file" accept=".json,.txt" className="hidden" onChange={loadFromFile} />
        </label>
      </div>

      {/* Type palette */}
      <div className="bg-white border-b px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 font-medium mr-1">타입 선택 →</span>
        {complex.types.map((type) => {
          const cfg = typeColorMap[type];
          const count = typeCounts[type] ?? 0;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedType === type ? "ring-2 ring-offset-1 ring-gray-800 scale-110" : "opacity-60 hover:opacity-90"
              }`}
              style={{ background: cfg.bg, color: cfg.text, border: `2px solid ${cfg.border}` }}
            >
              {type.toUpperCase()}
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-800 text-white text-[9px] rounded-full flex items-center justify-center font-black">
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <span className="text-xs text-gray-400 ml-auto">Ctrl+Z 취소 · 배치 모드에서 클릭 = 추가, 핫스팟 클릭 = 삭제</span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image area */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-md max-w-5xl mx-auto">
            <TransformWrapper
              panning={{ disabled: mode === "place" }}
              minScale={0.5}
              maxScale={8}
              doubleClick={{ disabled: true }}
            >
              <TransformComponent
                wrapperStyle={{ width: "100%", display: "block" }}
                contentStyle={{ width: "100%", display: "block" }}
              >
                <div
                  className="relative w-full"
                  style={{ cursor: mode === "place" ? "crosshair" : "grab" }}
                  onClick={handleImageClick}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={COMPLEX_IMAGE[complexId]}
                    alt={`${complex.name} 배치도`}
                    className="block w-full select-none"
                    draggable={false}
                  />
                  {hotspots.map((hs) => {
                    const cfg = typeColorMap[hs.type] ?? PALETTE[0];
                    return (
                      <button
                        key={hs.id}
                        onClick={(e) => removeHotspot(hs.id, e)}
                        title={`${hs.type} (${hs.x}, ${hs.y}) — 클릭 삭제`}
                        className="absolute rounded-full flex items-center justify-center font-black hover:brightness-75 transition-all"
                        style={{
                          left: `${hs.x}%`,
                          top: `${hs.y}%`,
                          transform: "translate(-50%, -50%)",
                          width: 22,
                          height: 22,
                          fontSize: 8,
                          background: cfg.bg,
                          border: `2px solid ${cfg.border}`,
                          color: cfg.text,
                          zIndex: 10,
                        }}
                      >
                        {hs.type.slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 bg-white border-l flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <p className="text-xs font-bold text-gray-800 mb-1">{complex.name} 코드 미리보기</p>
          </div>
          <pre className="flex-1 overflow-auto p-3 text-[10px] leading-relaxed font-mono text-green-700 bg-gray-950 whitespace-pre">
            {getComplexCode(complexId)}
          </pre>
          <div className="p-3 border-t bg-gray-50">
            <p className="text-[10px] text-gray-500">복사 후 vr-test/page.tsx의 FLOOR_PLAN_DATA에 붙여넣으세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
