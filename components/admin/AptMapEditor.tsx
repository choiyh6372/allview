"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { APT_COMPLEXES } from "@/lib/mapData";
import type { AptPositionOverrides } from "@/lib/aptPositionStore";

const REGION_LABELS: Record<string, string> = {
  ocean: "명지오션시티",
  kukje: "명지국제신도시",
  ecodelta: "에코델타시티",
};

export default function AptMapEditor() {
  const [selectedId, setSelectedId] = useState("");
  const [overrides, setOverrides] = useState<AptPositionOverrides>({});
  const [pendingPos, setPendingPos] = useState<{ lat: number; lng: number } | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState("");

  const miniMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const miniMapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const overridesRef = useRef(overrides);
  useEffect(() => { overridesRef.current = overrides; }, [overrides]);

  const selectedApt = APT_COMPLEXES.find((a) => a.id === selectedId) ?? null;
  const savedPos = selectedApt ? (overrides[selectedApt.id] ?? null) : null;
  const displayPos = pendingPos ?? savedPos ?? (selectedApt ? { lat: selectedApt.lat, lng: selectedApt.lng } : null);

  // 오버라이드 로드 + Kakao SDK 로드
  useEffect(() => {
    fetch("/api/admin/apt-positions")
      .then((r) => r.json())
      .then((data) => setOverrides(data ?? {}))
      .catch(() => {});

    fetch("/api/map-config")
      .then((r) => r.json())
      .then(({ kakaoKey }: { kakaoKey: string }) => {
        if (!kakaoKey) return;
        function onReady() { window.kakao.maps.load(() => setSdkReady(true)); }
        if (window.kakao?.maps) { onReady(); return; }
        const scriptId = "kakao-map-sdk";
        const existing = document.getElementById(scriptId);
        if (existing) { existing.addEventListener("load", onReady); return; }
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
        script.onload = onReady;
        document.head.appendChild(script);
      });
  }, []);

  // 아파트 선택 or SDK 준비 시 지도 초기화/업데이트
  useEffect(() => {
    if (!sdkReady || !selectedApt || !miniMapRef.current) return;

    const { kakao } = window;
    const pos = overridesRef.current[selectedApt.id] ?? { lat: selectedApt.lat, lng: selectedApt.lng };
    const latlng = new kakao.maps.LatLng(pos.lat, pos.lng);

    if (!miniMapInstanceRef.current) {
      const map = new kakao.maps.Map(miniMapRef.current, { center: latlng, level: 4 });
      miniMapInstanceRef.current = map;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marker = new (kakao.maps as any).Marker({ position: latlng, draggable: true, map });
      markerRef.current = marker;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (kakao.maps as any).event.addListener(marker, "dragend", () => {
        const p = marker.getPosition();
        setPendingPos({ lat: p.getLat(), lng: p.getLng() });
      });
    } else {
      markerRef.current?.setPosition(latlng);
      miniMapInstanceRef.current?.setCenter(latlng);
      setPendingPos(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, selectedId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function handleSave() {
    if (!selectedApt || !pendingPos) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/apt-positions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedApt.id, lat: pendingPos.lat, lng: pendingPos.lng }),
      });
      if (!res.ok) throw new Error();
      setOverrides((prev) => ({ ...prev, [selectedApt.id]: pendingPos }));
      setPendingPos(null);
      showToast("저장되었습니다");
    } catch {
      showToast("저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!selectedApt) return;
    setResetting(true);
    try {
      const res = await fetch("/api/admin/apt-positions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedApt.id }),
      });
      if (!res.ok) throw new Error();
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[selectedApt.id];
        return next;
      });
      // 기본 좌표로 마커 복원
      const latlng = new window.kakao.maps.LatLng(selectedApt.lat, selectedApt.lng);
      markerRef.current?.setPosition(latlng);
      miniMapInstanceRef.current?.setCenter(latlng);
      setPendingPos(null);
      showToast("기본 위치로 초기화했습니다");
    } catch {
      showToast("초기화 실패");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* 단지 선택 */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">단지 선택</label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setPendingPos(null);
          }}
          className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 focus:outline-none focus:border-accent/50 transition-colors"
        >
          <option value="">-- 단지를 선택하세요 --</option>
          {(["ocean", "kukje", "ecodelta"] as const).map((region) => (
            <optgroup key={region} label={REGION_LABELS[region]}>
              {APT_COMPLEXES.filter((a) => a.region === region).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}{overrides[a.id] ? " ✓" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* 미니맵 */}
      <div className="relative">
        <div
          ref={miniMapRef}
          className="w-full h-72 rounded-xl overflow-hidden border border-border bg-bg-hover"
        />
        {!selectedApt && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <p className="text-sm text-muted">단지를 선택하면 지도가 표시됩니다</p>
          </div>
        )}
        {selectedApt && !sdkReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-hover/80 rounded-xl">
            <Loader2 size={20} className="text-accent animate-spin" />
          </div>
        )}
      </div>

      {/* 좌표 및 액션 */}
      {selectedApt && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 p-3 bg-bg rounded-xl border border-border">
            <div className="space-y-1 text-xs min-w-0">
              {displayPos && (
                <p className="text-muted">
                  {pendingPos ? (
                    <span className="text-yellow-400">변경 예정 </span>
                  ) : savedPos ? (
                    <span className="text-green-400">저장된 위치 </span>
                  ) : (
                    <span>기본 위치 </span>
                  )}
                  <span className="text-gray-300 font-mono">
                    {displayPos.lat.toFixed(6)}, {displayPos.lng.toFixed(6)}
                  </span>
                </p>
              )}
              <p className="text-muted">핀을 드래그해 위치를 조정하세요</p>
            </div>

            <div className="flex gap-2 shrink-0">
              {savedPos && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting || !!pendingPos}
                  title="기본 위치로 초기화"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-gray-700 hover:text-gray-900 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors"
                >
                  {resetting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  초기화
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!pendingPos || saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                저장
              </button>
            </div>
          </div>

          {toast && (
            <p className="text-xs text-center text-green-400">{toast}</p>
          )}
        </div>
      )}
    </div>
  );
}
