"use client";

import { useEffect, useRef, useState } from "react";
import { APT_COMPLEXES, REGION_COLORS, REGION_CENTER, type AptComplex } from "@/lib/mapData";
import MapSidePanel from "@/components/map/MapSidePanel";
import MapBottomSheet from "@/components/map/MapBottomSheet";
import type { PromotionStore } from "@/lib/promotionStore";


// ── Kakao SDK type declarations ───────────────────────────────────────────────
interface KakaoLatLng { getLat: () => number; getLng: () => number; }
interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
}
interface KakaoCustomOverlay {
  setMap: (map: KakaoMapInstance | null) => void;
}
interface KakaoGeocoder {
  addressSearch: (addr: string, cb: (result: Array<{ x: string; y: string }>, status: string) => void) => void;
}
interface KakaoMaps {
  load: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: object) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  CustomOverlay: new (opts: object) => KakaoCustomOverlay;
  event: { addListener: (target: KakaoMapInstance, type: string, cb: () => void) => void };
  services: {
    Geocoder: new () => KakaoGeocoder;
    Status: { OK: string };
  };
}
declare global {
  interface Window { kakao: { maps: KakaoMaps } }
}
// ─────────────────────────────────────────────────────────────────────────────

// 가게 마커 SVG (쇼핑백 아이콘)
const STORE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;

export default function KakaoMap({ apiKey }: { apiKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const popupOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const setSelectedAptRef = useRef<((a: AptComplex | null) => void) | null>(null);
  const setSelectedStoreRef = useRef<((s: PromotionStore | null) => void) | null>(null);

  const [selectedApt, setSelectedApt] = useState<AptComplex | null>(null);
  const [selectedStore, setSelectedStore] = useState<PromotionStore | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setSelectedAptRef.current = setSelectedApt; }, []);
  useEffect(() => { setSelectedStoreRef.current = setSelectedStore; }, []);

  useEffect(() => {
    const scriptId = "kakao-map-sdk";
    if (!apiKey) return;
    if (document.getElementById(scriptId)) {
      if (window.kakao?.maps) initMap();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
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
    setSelectedStoreRef.current?.(null);
  }

  function openPopup(apt: AptComplex, map: KakaoMapInstance) {
    hidePopupOverlay();
    setSelectedAptRef.current?.(apt);
    setSelectedStoreRef.current?.(null);
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
    wrap.addEventListener("click", (e) => e.stopPropagation());
    wrap.addEventListener("mousedown", (e) => e.stopPropagation());
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

  function placeStoreMarker(store: PromotionStore, lat: number, lng: number, map: KakaoMapInstance) {
    const { kakao } = window;

    const photo = store.photos?.[0];
    const pin = document.createElement("div");
    pin.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
    if (photo) {
      pin.innerHTML = `
        <div style="width:40px;height:40px;border-radius:8px;overflow:hidden;
          box-shadow:0 2px 8px rgba(0,0,0,0.45);border:2px solid #fff;">
          <img src="${photo}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;
          border-right:5px solid transparent;border-top:6px solid #fff;margin-top:-1px;
          filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));"></div>`;
    } else {
      pin.innerHTML = `
        <div style="width:36px;height:36px;background:#f97316;border-radius:8px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid #fff;">
          ${STORE_ICON_SVG}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;
          border-right:5px solid transparent;border-top:6px solid #f97316;"></div>`;
    }

    // 클릭 시 아파트 팝업과 동일한 스타일
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      hidePopupOverlay();
      setSelectedAptRef.current?.(null);
      setSelectedStoreRef.current?.(store);

      const card = document.createElement("div");
      card.style.cssText = `
        background:rgba(15,17,23,0.96);border:1px solid rgba(42,45,62,1);
        border-radius:12px;padding:12px 14px 10px;min-width:200px;max-width:260px;
        box-shadow:0 6px 24px rgba(0,0,0,0.7);position:relative;
      `;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.style.cssText =
        "position:absolute;top:7px;right:9px;background:none;border:none;color:#6b7280;font-size:17px;cursor:pointer;line-height:1;padding:0;";
      closeBtn.addEventListener("click", (ev) => { ev.stopPropagation(); hidePopupOverlay(); });

      const storeName = document.createElement("div");
      storeName.textContent = store.name;
      storeName.style.cssText =
        "color:#fff;font-size:13px;font-weight:700;margin-bottom:8px;padding-right:20px;";

      card.append(closeBtn, storeName);

      if (store.photos?.length > 0) {
        let current = 0;
        const photos = store.photos;

        const carousel = document.createElement("div");
        carousel.style.cssText = "position:relative;width:100%;border-radius:8px;overflow:hidden;";

        const img = document.createElement("img");
        img.src = photos[0];
        img.style.cssText = "width:100%;height:150px;object-fit:cover;display:block;";
        carousel.appendChild(img);

        if (photos.length > 1) {
          const counter = document.createElement("div");
          counter.style.cssText =
            "position:absolute;bottom:6px;right:8px;background:rgba(0,0,0,0.55);color:#fff;font-size:10px;padding:2px 6px;border-radius:99px;";
          counter.textContent = `1 / ${photos.length}`;

          const btnStyle =
            "position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);border:none;color:#fff;font-size:16px;cursor:pointer;padding:4px 8px;border-radius:4px;line-height:1;";

          const prev = document.createElement("button");
          prev.textContent = "‹";
          prev.style.cssText = btnStyle + "left:4px;";
          prev.addEventListener("click", (ev) => {
            ev.stopPropagation();
            current = (current - 1 + photos.length) % photos.length;
            img.src = photos[current];
            counter.textContent = `${current + 1} / ${photos.length}`;
          });

          const next = document.createElement("button");
          next.textContent = "›";
          next.style.cssText = btnStyle + "right:4px;";
          next.addEventListener("click", (ev) => {
            ev.stopPropagation();
            current = (current + 1) % photos.length;
            img.src = photos[current];
            counter.textContent = `${current + 1} / ${photos.length}`;
          });

          carousel.append(prev, next, counter);
        }

        card.appendChild(carousel);
      }

      const arrow = document.createElement("div");
      arrow.style.cssText =
        "width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:9px solid rgba(42,45,62,1);margin:0 auto;";

      const spacer = document.createElement("div");
      spacer.style.height = "30px";

      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;";
      wrap.addEventListener("click", (e) => e.stopPropagation());
      wrap.addEventListener("mousedown", (e) => e.stopPropagation());
      wrap.append(card, arrow, spacer);

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: wrap,
        yAnchor: 1,
        zIndex: 10,
      });
      overlay.setMap(map);
      popupOverlayRef.current = overlay;
    });

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(lat, lng),
      content: pin,
      yAnchor: 1,
      zIndex: 2,
    });
    overlay.setMap(map);
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

    // 아파트 핀
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

    // 가게 핀 (주소 → 좌표 변환 후 배치)
    fetch("/api/stores")
      .then((r) => r.json())
      .then((stores: PromotionStore[]) => {
        const geocoder = new kakao.maps.services.Geocoder();
        stores.forEach((store) => {
          if (!store.address) return;
          geocoder.addressSearch(store.address, (result, status) => {
            if (status !== kakao.maps.services.Status.OK || !result[0]) return;
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            placeStoreMarker(store, lat, lng, map);
          });
        });
      })
      .catch(() => {});

    setLoaded(true);
  }

  return (
    <div className="flex w-full h-full">
      <MapSidePanel
        selectedApt={selectedApt}
        selectedStore={selectedStore}
        onClose={closePopup}
      />

      <MapBottomSheet
        selectedApt={selectedApt}
        selectedStore={selectedStore}
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
