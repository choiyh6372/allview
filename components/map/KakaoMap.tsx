"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { APT_COMPLEXES, REGION_COLORS, REGION_NAME_COLORS, REGION_CENTER, type AptComplex } from "@/lib/mapData";
import { SCHOOL_POS_OVERRIDES } from "@/lib/schoolPositions";
import MapSidePanel from "@/components/map/MapSidePanel";
import MapBottomSheet from "@/components/map/MapBottomSheet";
import type { PromotionStore } from "@/lib/promotionStore";

// ── Kakao SDK type declarations ───────────────────────────────────────────────
interface KakaoLatLng { getLat: () => number; getLng: () => number; }
interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  getLevel: () => number;
}
interface KakaoCustomOverlay {
  setMap: (map: KakaoMapInstance | null) => void;
}
interface KakaoMarker {
  getPosition: () => KakaoLatLng;
  setPosition: (latlng: KakaoLatLng) => void;
  setMap: (map: KakaoMapInstance | null) => void;
}
interface KakaoGeocoder {
  addressSearch: (addr: string, cb: (result: Array<{ x: string; y: string }>, status: string) => void) => void;
}
interface KakaoPlacesResult {
  x: string;
  y: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
}
interface KakaoPlaces {
  keywordSearch: (
    query: string,
    cb: (result: KakaoPlacesResult[], status: string) => void,
    opts?: { size?: number }
  ) => void;
}
interface KakaoPolygon {
  setMap: (map: KakaoMapInstance | null) => void;
  setOptions: (opts: { fillOpacity?: number; strokeOpacity?: number; strokeWeight?: number }) => void;
}
interface KakaoMaps {
  load: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: object) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  CustomOverlay: new (opts: object) => KakaoCustomOverlay;
  Marker: new (opts: { position: KakaoLatLng; draggable?: boolean; map?: KakaoMapInstance }) => KakaoMarker;
  Polygon: new (opts: {
    path: KakaoLatLng[] | KakaoLatLng[][];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    fillColor?: string;
    fillOpacity?: number;
    zIndex?: number;
  }) => KakaoPolygon;
  event: { addListener: (target: KakaoMapInstance | KakaoMarker | KakaoPolygon, type: string, cb: (e?: MouseEvent) => void) => void };
  services: {
    Geocoder: new () => KakaoGeocoder;
    Places: new () => KakaoPlaces;
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
  const hoverOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const setSelectedAptRef = useRef<((a: AptComplex | null) => void) | null>(null);
  const setSelectedStoreRef = useRef<((s: PromotionStore | null) => void) | null>(null);
  const storePositionsRef = useRef<Map<string, { store: PromotionStore; lat: number; lng: number }>>(new Map());
  const pendingStoreIdRef = useRef<string | null>(null);

  const searchParams = useSearchParams();

  const [selectedApt, setSelectedApt] = useState<AptComplex | null>(null);
  const [selectedStore, setSelectedStore] = useState<PromotionStore | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showSchoolZones, setShowSchoolZones] = useState(false);
  const [schoolZoneLoading, setSchoolZoneLoading] = useState(false);
  const schoolPolygonsRef = useRef<KakaoPolygon[]>([]);
  const schoolLabelsRef = useRef<KakaoCustomOverlay[]>([]);
  const schoolMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const schoolZonesLoadedRef = useRef(false);
  const schoolDeselectRef = useRef<(() => void) | null>(null);

  type SchoolGroup = { polygons: KakaoPolygon[]; label: KakaoCustomOverlay; labelEl: HTMLElement };

  useEffect(() => { setSelectedAptRef.current = setSelectedApt; }, []);
  useEffect(() => { setSelectedStoreRef.current = setSelectedStore; }, []);

  useEffect(() => {
    const storeId = searchParams.get("storeId");
    if (!storeId) return;
    const map = mapRef.current;
    const entry = storePositionsRef.current.get(storeId);
    if (entry && map) {
      activateStore(entry.store, entry.lat, entry.lng, map);
      return;
    }
    pendingStoreIdRef.current = storeId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const scriptId = "kakao-map-sdk";
    if (!apiKey) return;

    async function boot() {
      let posOverrides: Record<string, { lat: number; lng: number }> = {};
      try {
        const res = await fetch("/api/apt-positions");
        posOverrides = await res.json();
      } catch {}
      window.kakao.maps.load(() => initMap(posOverrides));
    }

    if (document.getElementById(scriptId)) {
      if (window.kakao?.maps) boot();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
    script.onload = () => boot();
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSchoolZones(map: KakaoMapInstance) {
    const { kakao } = window;
    setSchoolZoneLoading(true);
    try {
      const res = await fetch("/api/school-zones");
      const geojson = await res.json();

      const groups: SchoolGroup[] = [];
      let selectedIdx = -1;

      const applySelection = (idx: number) => {
        if (selectedIdx === idx) {
          selectedIdx = -1;
          groups.forEach(({ polygons, label }) => {
            polygons.forEach((p) => p.setMap(null));
            label.setMap(null);
          });
          return;
        }
        selectedIdx = idx;
        groups.forEach(({ polygons, label }, i) => {
          if (i === idx) {
            polygons.forEach((p) => {
              p.setOptions({ fillOpacity: 0.3, strokeOpacity: 1, strokeWeight: 2 });
              p.setMap(map);
            });
            label.setMap(map);
          } else {
            polygons.forEach((p) => p.setMap(null));
            label.setMap(null);
          }
        });
      };

      const deselectAll = () => {
        if (selectedIdx === -1) return;
        selectedIdx = -1;
        groups.forEach(({ polygons, label }) => {
          polygons.forEach((p) => p.setMap(null));
          label.setMap(null);
        });
      };
      schoolDeselectRef.current = deselectAll;

      kakao.maps.event.addListener(map, "click", deselectAll);

      const allPolygons: KakaoPolygon[] = [];
      const allLabels: KakaoCustomOverlay[] = [];

      for (let fi = 0; fi < geojson.features.length; fi++) {
        const feature = geojson.features[fi];
        // MultiPolygon → 서브폴리곤 배열, Polygon → 단일 서브폴리곤 배열
        const subPolygons: [number, number][][][] = feature.geometry.type === "MultiPolygon"
          ? feature.geometry.coordinates
          : [feature.geometry.coordinates];

        const groupPolygons: KakaoPolygon[] = [];
        for (const subPoly of subPolygons) {
          // subPoly[0] = 외곽링, subPoly[1..] = 구멍(holes)
          const path = (subPoly as [number, number][][]).map((ring) =>
            ring.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng))
          );
          const polygon = new kakao.maps.Polygon({
            path,
            strokeWeight: 2,
            strokeColor: "#2563eb",
            strokeOpacity: 1,
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            zIndex: 1,
          });
          polygon.setMap(null);
          groupPolygons.push(polygon);
          allPolygons.push(polygon);
          const capturedIdx = fi;
          kakao.maps.event.addListener(polygon, "click", (e) => {
            e?.stopPropagation?.();
            applySelection(capturedIdx);
          });
        }

        const ring0 = subPolygons[0][0] as [number, number][];
        const lngs = ring0.map((c) => c[0]);
        const lats = ring0.map((c) => c[1]);
        const centroidLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const centroidLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const name = (feature.properties.HAKGUDO_NM as string).replace("통학구역", "").trim();

        const el = document.createElement("div");
        el.style.cssText = "background:rgba(37,99,235,0.9);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;cursor:pointer;transition:opacity 0.15s;";
        el.textContent = name;
        const capturedIdx = fi;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          applySelection(capturedIdx);
        });

        const overlay = new kakao.maps.CustomOverlay({ position: new kakao.maps.LatLng(centroidLat, centroidLng), content: el, zIndex: 2 });
        overlay.setMap(null);
        allLabels.push(overlay);
        groups.push({ polygons: groupPolygons, label: overlay, labelEl: el });
      }

      schoolPolygonsRef.current = allPolygons;
      schoolLabelsRef.current = allLabels;

      // Places API로 학교 위치 검색, 학구도 밖이면 중심점으로 대체
      const ps = new kakao.maps.services.Places();
      const schoolMarkers: KakaoCustomOverlay[] = [];
      for (let fi = 0; fi < geojson.features.length; fi++) {
        const feature = geojson.features[fi];
        const rings = feature.geometry.type === "MultiPolygon"
          ? feature.geometry.coordinates.map((p: [number, number][][]) => p[0])
          : [feature.geometry.coordinates[0]];
        const ring0 = rings[0] as [number, number][];
        const lngs = ring0.map((c: [number, number]) => c[0]);
        const lats = ring0.map((c: [number, number]) => c[1]);
        const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const name = (feature.properties.HAKGUDO_NM as string).replace("통학구역", "").trim();

        const override = SCHOOL_POS_OVERRIDES[name];
        const placePos = override ?? await new Promise<{ lat: number; lng: number } | null>((resolve) => {
          ps.keywordSearch(`부산 강서구 ${name}`, (results, status) => {
            if (status !== kakao.maps.services.Status.OK || !results[0]) { resolve(null); return; }
            const lat = parseFloat(results[0].y);
            const lng = parseFloat(results[0].x);
            const margin = 0.01;
            const inBounds = lat >= Math.min(...lats) - margin && lat <= Math.max(...lats) + margin
                          && lng >= Math.min(...lngs) - margin && lng <= Math.max(...lngs) + margin;
            resolve(inBounds ? { lat, lng } : null);
          }, { size: 1 });
        });

        const { lat: mLat, lng: mLng } = placePos ?? { lat: cLat, lng: cLng };
        const pin = document.createElement("div");
        pin.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.45));";
        pin.innerHTML = `
          <div style="background:#fff;border:3px solid #ec4899;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:22px;">
            🏫
          </div>
          <div style="background:#ec4899;color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;margin-top:3px;white-space:nowrap;letter-spacing:-0.2px;">
            ${name}
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #ec4899;"></div>`;
        const capturedIdx = fi;
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          hidePopupOverlay();
          applySelection(capturedIdx);
        });
        const marker = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(mLat, mLng),
          content: pin,
          yAnchor: 1,
          zIndex: 5,
        });
        marker.setMap(map);
        schoolMarkers.push(marker);
      }
      schoolMarkersRef.current = schoolMarkers;
    } catch (e) {
      console.error("[학구도] 로딩 실패", e);
    } finally {
      setSchoolZoneLoading(false);
    }
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showSchoolZones) {
      if (!schoolZonesLoadedRef.current) {
        schoolZonesLoadedRef.current = true;
        loadSchoolZones(map);
      } else {
        schoolMarkersRef.current.forEach((m) => m.setMap(map));
      }
    } else {
      schoolDeselectRef.current?.();
      schoolMarkersRef.current.forEach((m) => m.setMap(null));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSchoolZones]);

  function hidePopupOverlay() {
    popupOverlayRef.current?.setMap(null);
    popupOverlayRef.current = null;
  }

  function openStorePopupOverlay(store: PromotionStore, lat: number, lng: number, map: KakaoMapInstance) {
    const { kakao } = window;
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
  }

  function activateStore(store: PromotionStore, lat: number, lng: number, map: KakaoMapInstance) {
    const { kakao } = window;
    hidePopupOverlay();
    setSelectedAptRef.current?.(null);
    setSelectedStoreRef.current?.(store);
    openStorePopupOverlay(store, lat, lng, map);
    map.setCenter(new kakao.maps.LatLng(lat, lng));
    map.setLevel(3);
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

    const color = REGION_NAME_COLORS[apt.regionName] ?? REGION_COLORS[apt.region];

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
          box-shadow:0 2px 8px rgba(0,0,0,0.45);border:2.5px solid #f97316;">
          <img src="${photo}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;
          border-right:5px solid transparent;border-top:6px solid #f97316;margin-top:-1px;
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

    pin.addEventListener("mouseenter", () => {
      hoverOverlayRef.current?.setMap(null);

      const card = document.createElement("div");
      card.style.cssText = `
        background:rgba(15,17,23,0.96);border:1px solid rgba(42,45,62,1);
        border-radius:12px;padding:12px 14px 10px;min-width:200px;max-width:260px;
        box-shadow:0 6px 24px rgba(0,0,0,0.7);
      `;

      const storeName = document.createElement("div");
      storeName.textContent = store.name;
      storeName.style.cssText = "color:#fff;font-size:13px;font-weight:700;margin-bottom:8px;";
      card.appendChild(storeName);

      if (store.photos?.length > 0) {
        const img = document.createElement("img");
        img.src = store.photos[0];
        img.style.cssText = "width:100%;height:130px;object-fit:cover;border-radius:8px;display:block;";
        card.appendChild(img);
      }

      const arrow = document.createElement("div");
      arrow.style.cssText = "width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:9px solid rgba(42,45,62,1);margin:0 auto;";

      const spacer = document.createElement("div");
      spacer.style.height = "30px";

      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;pointer-events:none;";
      wrap.append(card, arrow, spacer);

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: wrap,
        yAnchor: 1,
        zIndex: 9,
      });
      overlay.setMap(map);
      // Kakao wraps content in its own container div — disable pointer events
      // so the overlay doesn't intercept mouse events from the pin underneath
      if (wrap.parentElement) wrap.parentElement.style.pointerEvents = "none";
      hoverOverlayRef.current = overlay;
    });

    pin.addEventListener("mouseleave", () => {
      hoverOverlayRef.current?.setMap(null);
      hoverOverlayRef.current = null;
    });

    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      hoverOverlayRef.current?.setMap(null);
      hoverOverlayRef.current = null;
      activateStore(store, lat, lng, map);
    });

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(lat, lng),
      content: pin,
      yAnchor: 1,
      zIndex: 2,
    });
    overlay.setMap(map);
  }

  function initMap(posOverrides: Record<string, { lat: number; lng: number }> = {}) {
    if (!containerRef.current) return;
    const { kakao } = window;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(REGION_CENTER.kukje.lat, REGION_CENTER.kukje.lng),
      level: REGION_CENTER.kukje.level,
    });
    mapRef.current = map;

    kakao.maps.event.addListener(map, "click", hidePopupOverlay);

    // ── 줌 레벨별 마커 가시성 ────────────────────────────────────────────────
    const ZOOM_THRESHOLD = 6; // 이 레벨 이상(더 축소)이면 지역명만 표시
    const aptOverlays: KakaoCustomOverlay[] = [];
    const regionOverlays: KakaoCustomOverlay[] = [];

    function updateVisibility() {
      const level = map.getLevel();
      const zoomed = level >= ZOOM_THRESHOLD;
      aptOverlays.forEach((o) => o.setMap(zoomed ? null : map));
      regionOverlays.forEach((o) => o.setMap(zoomed ? map : null));
    }
    kakao.maps.event.addListener(map, "zoom_changed", updateVisibility);

    // 아파트 핀 (저장된 좌표 오버라이드 반영)
    APT_COMPLEXES.forEach((apt) => {
      const lat = posOverrides[apt.id]?.lat ?? apt.lat;
      const lng = posOverrides[apt.id]?.lng ?? apt.lng;
      const aptWithPos = { ...apt, lat, lng };

      const color = REGION_NAME_COLORS[apt.regionName] ?? REGION_COLORS[apt.region];
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
        openPopup(aptWithPos, map);
        map.setCenter(new kakao.maps.LatLng(lat, lng));
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content,
        yAnchor: 1,
        zIndex: 3,
      });
      overlay.setMap(map);
      aptOverlays.push(overlay);
    });

    // 지역명 마커 (축소 시 표시)
    const REGION_LABELS = [
      { region: "ocean"    as const, name: "명지오션시티",    ...REGION_CENTER.ocean },
      { region: "kukje"    as const, name: "명지국제신도시",  ...REGION_CENTER.kukje },
      { region: "ecodelta" as const, name: "에코델타시티",    ...REGION_CENTER.ecodelta },
      { region: "other"    as const, name: "신호동",          color: "#8b5cf6", lat: 35.0850, lng: 128.8775, level: 5 },
      { region: "other"    as const, name: "화전동",          color: "#06b6d4", lat: 35.1062, lng: 128.8830, level: 5 },
      { region: "other"    as const, name: "지사동",          color: "#10b981", lat: 35.1513, lng: 128.8369, level: 5 },
      { region: "other"    as const, name: "대저동",          color: "#f43f5e", lat: 35.2143, lng: 128.9794, level: 5 },
    ];
    REGION_LABELS.forEach(({ region, name, lat, lng, level, color: labelColor }) => {
      const color = labelColor ?? REGION_COLORS[region];
      const content = document.createElement("div");
      content.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
      content.innerHTML = `
        <div style="background:${color};color:#fff;font-size:13px;font-weight:800;
          padding:6px 14px;border-radius:8px;white-space:nowrap;letter-spacing:-0.3px;
          box-shadow:0 3px 12px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.25);
          transition:transform 0.15s,box-shadow 0.15s;"
          onmouseover="this.style.transform='scale(1.07)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
          onmouseout="this.style.transform='';this.style.boxShadow='0 3px 12px rgba(0,0,0,0.5)';">
          ${name}
        </div>
        <div style="width:0;height:0;border-left:8px solid transparent;
          border-right:8px solid transparent;border-top:10px solid ${color};margin-top:-1px;"></div>`;
      content.addEventListener("click", () => {
        map.setCenter(new kakao.maps.LatLng(lat, lng));
        map.setLevel(level);
      });
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content,
        yAnchor: 1,
        zIndex: 4,
      });
      regionOverlays.push(overlay);
    });

    // 초기 줌 레벨 적용
    updateVisibility();

    // 가게 핀 (저장된 좌표 있으면 직접 사용, 없으면 주소 geocoding)
    fetch("/api/stores")
      .then((r) => r.json())
      .then((stores: PromotionStore[]) => {
        const geocoder = new kakao.maps.services.Geocoder();

        const addStore = (store: PromotionStore, sLat: number, sLng: number) => {
          storePositionsRef.current.set(store.id, { store, lat: sLat, lng: sLng });
          placeStoreMarker(store, sLat, sLng, map);
          if (pendingStoreIdRef.current === store.id) {
            pendingStoreIdRef.current = null;
            activateStore(store, sLat, sLng, map);
          }
        };

        stores.forEach((store) => {
          if (store.lat && store.lng) {
            addStore(store, store.lat, store.lng);
            return;
          }
          if (!store.address) return;
          geocoder.addressSearch(store.address, (result, status) => {
            if (status !== kakao.maps.services.Status.OK || !result[0]) return;
            addStore(store, parseFloat(result[0].y), parseFloat(result[0].x));
          });
        });
      })
      .catch(() => {});

    setLoaded(true);

    // 강서구 전체 거래 단지 동적 마커 (Places keywordSearch)
    fetch("/api/apt-complexes")
      .then((r) => r.json())
      .then(async (list: { aptNm: string; umdNm: string }[]) => {
        const ps = new kakao.maps.services.Places();
        const BATCH = 5;
        for (let i = 0; i < list.length; i += BATCH) {
          await Promise.all(
            list.slice(i, i + BATCH).map(
              (apt) =>
                new Promise<void>((resolve) => {
                  const query = `부산 강서구 ${apt.umdNm ? apt.umdNm + " " : ""}${apt.aptNm}`;
                  ps.keywordSearch(
                    query,
                    (result, status) => {
                      if (status === kakao.maps.services.Status.OK && result[0]) {
                        const lat = parseFloat(result[0].y);
                        const lng = parseFloat(result[0].x);

                        const aptObj: AptComplex = {
                          id: `dynamic_${apt.aptNm}`,
                          name: apt.aptNm,
                          region: "other",
                          regionName: apt.umdNm || "강서구",
                          address:
                            result[0].road_address_name ||
                            result[0].address_name ||
                            `부산 강서구 ${apt.umdNm}`,
                          lat,
                          lng,
                        };

                        const color = REGION_NAME_COLORS[apt.umdNm] ?? REGION_COLORS["other"];
                        const content = document.createElement("div");
                        content.style.cssText =
                          "position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;";
                        content.innerHTML = `
                          <div style="background:${color};color:#fff;font-size:11px;font-weight:700;
                            padding:4px 8px;border-radius:6px;white-space:nowrap;
                            box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);">
                            ${apt.aptNm}
                          </div>
                          <div style="width:0;height:0;border-left:6px solid transparent;
                            border-right:6px solid transparent;border-top:8px solid ${color};"></div>`;
                        content.addEventListener("click", (e) => {
                          e.stopPropagation();
                          openPopup(aptObj, map);
                          map.setCenter(new kakao.maps.LatLng(lat, lng));
                        });

                        const overlay = new kakao.maps.CustomOverlay({
                          position: new kakao.maps.LatLng(lat, lng),
                          content,
                          yAnchor: 1,
                          zIndex: 2,
                        });
                        overlay.setMap(map.getLevel() >= ZOOM_THRESHOLD ? null : map);
                        aptOverlays.push(overlay);
                      }
                      resolve();
                    },
                    { size: 1 }
                  );
                })
            )
          );
        }
      })
      .catch(() => {});
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
        {loaded && (
          <button
            onClick={() => setShowSchoolZones((v) => !v)}
            disabled={schoolZoneLoading}
            className={`absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow transition-colors ${
              showSchoolZones
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } disabled:opacity-60`}
          >
            {schoolZoneLoading ? "로딩 중..." : "🏫 학구도"}
          </button>
        )}
      </div>
    </div>
  );
}
