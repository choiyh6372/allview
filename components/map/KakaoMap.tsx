"use client";

import { useEffect, useRef, useState } from "react";
import { APT_COMPLEXES, REGION_COLORS, MAP_DEFAULT, REGION_CENTER, type AptComplex } from "@/lib/mapData";
import MapSidePanel from "@/components/map/MapSidePanel";

// ── Kakao SDK type declarations ───────────────────────────────────────────────
interface KakaoLatLng { getLat: () => number; getLng: () => number; }
interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
}
interface KakaoCustomOverlay {
  setMap: (map: KakaoMapInstance | null) => void;
}
interface KakaoMaps {
  load: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: object) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  CustomOverlay: new (opts: object) => KakaoCustomOverlay;
  event: { addListener: (target: KakaoMapInstance, type: string, cb: () => void) => void };
}
declare global {
  interface Window { kakao: { maps: KakaoMaps } }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function KakaoMap({ apiKey }: { apiKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const popupOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const setSelectedAptRef = useRef<((a: AptComplex | null) => void) | null>(null);

  const [selectedApt, setSelectedApt] = useState<AptComplex | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setSelectedAptRef.current = setSelectedApt; }, []);

  useEffect(() => {
    const scriptId = "kakao-map-sdk";
    if (!apiKey) return;
    if (document.getElementById(scriptId)) {
      if (window.kakao?.maps) initMap();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.onload = () => window.kakao.maps.load(initMap);
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hidePopupOverlay() {
    popupOverlayRef.current?.setMap(null);
    popupOverlayRef.current = null;
  }

  function closePopup() {
    hidePopupOverlay();
    setSelectedAptRef.current?.(null);
  }

  function openPopup(apt: AptComplex, map: KakaoMapInstance) {
    hidePopupOverlay();
    setSelectedAptRef.current?.(apt);
    console.log('[Map] 클릭:', apt.name, '→ API명:', apt.apiName ?? apt.name);

    const color = REGION_COLORS[apt.region];

    const card = document.createElement("div");
    card.style.cssText = `
      background:rgba(15,17,23,0.96);border:1px solid rgba(42,45,62,1);
      border-radius:12px;padding:12px 14px 10px;min-width:170px;max-width:220px;
      box-shadow:0 6px 24px rgba(0,0,0,0.7);position:relative;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.style.cssText =
      "position:absolute;top:7px;right:9px;background:none;border:none;color:#6b7280;font-size:17px;cursor:pointer;line-height:1;padding:0;";
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); hidePopupOverlay(); });

    const badge = document.createElement("span");
    badge.textContent = apt.regionName;
    badge.style.cssText = `display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;margin-bottom:6px;background:${color}33;color:${color};`;

    const name = document.createElement("div");
    name.textContent = apt.name;
    name.style.cssText = "color:#fff;font-size:13px;font-weight:700;margin-bottom:3px;padding-right:20px;";

    const addr = document.createElement("div");
    addr.textContent = apt.address;
    addr.style.cssText = "color:#9ca3af;font-size:11px;line-height:1.5;";

    card.append(closeBtn, badge, name, addr);

    const arrow = document.createElement("div");
    arrow.style.cssText = "width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:9px solid rgba(42,45,62,1);margin:0 auto;";

    const spacer = document.createElement("div");
    spacer.style.height = "30px";

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;";
    wrap.append(card, arrow, spacer);

    const { kakao } = window;
    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(apt.lat, apt.lng),
      content: wrap,
      yAnchor: 1,
      zIndex: 10,
    });
    overlay.setMap(map);
    popupOverlayRef.current = overlay;
  }

  function initMap() {
    if (!containerRef.current) return;
    const { kakao } = window;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(REGION_CENTER.kukje.lat, REGION_CENTER.kukje.lng),
      level: REGION_CENTER.kukje.level,
    });
    mapRef.current = map;

    kakao.maps.event.addListener(map, "click", hidePopupOverlay);

    APT_COMPLEXES.forEach((apt) => {
      const color = REGION_COLORS[apt.region];
      const content = document.createElement("div");
      content.style.cssText =
        "position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;";
      content.innerHTML = `
        <div style="background:${color};color:#fff;font-size:11px;font-weight:700;
          padding:4px 8px;border-radius:6px;white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);">
          ${apt.name}
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;
          border-right:6px solid transparent;border-top:8px solid ${color};"></div>`;
      content.addEventListener("click", (e) => {
        e.stopPropagation();
        openPopup(apt, map);
        map.setCenter(new kakao.maps.LatLng(apt.lat, apt.lng));
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(apt.lat, apt.lng),
        content,
        yAnchor: 1,
        zIndex: 3,
      });
      overlay.setMap(map);
    });

    setLoaded(true);
  }

  return (
    <div className="flex w-full h-full">
      <MapSidePanel
        selectedApt={selectedApt}
        onClose={closePopup}
      />

      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0" />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg">
            <span className="text-gray-400 text-sm">지도 로딩 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
