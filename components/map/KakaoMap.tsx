"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { APT_COMPLEXES, REGION_COLORS, REGION_NAME_COLORS, REGION_CENTER, OFFI_SHORT_NAMES, RH_SHORT_NAMES, type AptComplex } from "@/lib/mapData";
import { SCHOOL_POS_OVERRIDES } from "@/lib/schoolPositions";
import MapSidePanel from "@/components/map/MapSidePanel";
import MapTransactionPanel from "@/components/map/MapTransactionPanel";
import MapBottomSheet from "@/components/map/MapBottomSheet";
import type { PromotionStore } from "@/lib/promotionStore";
import type { SubscriptionItem } from "@/app/api/subscription/route";
import { type JeongbiProject, JEONGBI_TYPE_COLOR, JEONGBI_TYPE_ICON } from "@/lib/jeongbiData";
import type { AreaTypeMap } from "@/lib/parseAptMapping";
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
  coord2Address: (lng: number, lat: number, cb: (result: Array<{ address: { address_name: string }; road_address: { address_name: string } | null }>, status: string) => void) => void;
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

export interface SelectedProperty {
  name: string;
  umdNm: string;
  address: string;
  propertyType: "offi" | "rh";
}

// 가게 마커 SVG (쇼핑백 아이콘)
const STORE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;


const OFFI_POS_OVERRIDES: Record<string, { lat: number; lng: number }> = {
  "더샵 명지퍼스트월드 2단지":          { lat: 35.097341, lng: 128.907251 },
  "명지국제신도시 삼정그린코아 더베스트": { lat: 35.098551, lng: 128.911221 },
};


const ZOOM_THRESHOLD = 6;

const JEONGBI_POLY_COLOR: Record<string, string> = {
  "재개발":       "#ef4444",
  "재건축":       "#f97316",
  "도시환경정비": "#8b5cf6",
  "주거환경개선": "#06b6d4",
  "주거환경관리": "#10b981",
  "기반시설":     "#6b7280",
  "기타":         "#94a3b8",
};

export default function KakaoMap({ apiKey, areaTypeMap = {} }: { apiKey: string; areaTypeMap?: AreaTypeMap }) {
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
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<SelectedProperty | null>(null);
  const [selectedJeongbi, setSelectedJeongbi] = useState<JeongbiProject | null>(null);
  const [txPanelOpen, setTxPanelOpen] = useState(false);
  const [sharedArea, setSharedArea] = useState("");
  const setSelectedSubscriptionRef = useRef<((s: SubscriptionItem | null) => void) | null>(null);
  const setSelectedPropertyRef = useRef<((p: SelectedProperty | null) => void) | null>(null);
  const setSelectedJeongbiRef = useRef<((j: JeongbiProject | null) => void) | null>(null);
  const subscriptionMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const jeongbiMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const jeongbiGuMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const ignoreNextMapClickRef = useRef(false);
  const isHandlingMarkerClickRef = useRef(false);
  const jeongbiVisibilityRef = useRef<(() => void) | null>(null);
  const offiMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const rhMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const aptOverlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const regionOverlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const storeMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const updateVisibilityRef = useRef<(() => void) | null>(null);
  const showJeongbiRef = useRef(false);
  const showSubscriptionRef = useRef(false);
  const subscriptionLoadedRef = useRef(false);
  const jeongbiLoadedRef = useRef(false);
  const jeongbiPolygonsRef = useRef<KakaoPolygon[]>([]);
  const offiLoadedRef = useRef(false);
  const rhLoadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [showSchoolZones, setShowSchoolZones] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showJeongbi, setShowJeongbi] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [jeongbiLoading, setJeongbiLoading] = useState(false);
  const [schoolZoneLoading, setSchoolZoneLoading] = useState(false);
  const schoolPolygonsRef = useRef<KakaoPolygon[]>([]);
  const schoolLabelsRef = useRef<KakaoCustomOverlay[]>([]);
  const schoolMarkersRef = useRef<KakaoCustomOverlay[]>([]);
  const schoolZonesLoadedRef = useRef(false);
  const schoolDeselectRef = useRef<(() => void) | null>(null);

  type SchoolGroup = { polygons: KakaoPolygon[]; label: KakaoCustomOverlay; labelEl: HTMLElement };

  useEffect(() => { setSelectedAptRef.current = setSelectedApt; }, []);
  useEffect(() => { setSelectedStoreRef.current = setSelectedStore; }, []);
  useEffect(() => { setSelectedSubscriptionRef.current = setSelectedSubscription; }, []);
  useEffect(() => { setSelectedPropertyRef.current = setSelectedProperty; }, []);
  useEffect(() => { setSelectedJeongbiRef.current = setSelectedJeongbi; }, []);
  useEffect(() => { showJeongbiRef.current = showJeongbi; }, [showJeongbi]);
  useEffect(() => { showSubscriptionRef.current = showSubscription; }, [showSubscription]);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showSubscription) {
      aptOverlaysRef.current.forEach((o) => o.setMap(null));
      regionOverlaysRef.current.forEach((o) => o.setMap(null));
      storeMarkersRef.current.forEach((o) => o.setMap(null));
      offiMarkersRef.current.forEach((o) => o.setMap(null));
      rhMarkersRef.current.forEach((o) => o.setMap(null));
      if (!subscriptionLoadedRef.current) {
        subscriptionLoadedRef.current = true;
        loadSubscriptionMarkers(map);
      } else {
        subscriptionMarkersRef.current.forEach((m) => m.setMap(map));
      }
    } else {
      subscriptionMarkersRef.current.forEach((m) => m.setMap(null));
      updateVisibilityRef.current?.();
      storeMarkersRef.current.forEach((o) => o.setMap(map));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSubscription]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showJeongbi) {
      aptOverlaysRef.current.forEach((o) => o.setMap(null));
      regionOverlaysRef.current.forEach((o) => o.setMap(null));
      storeMarkersRef.current.forEach((o) => o.setMap(null));
      offiMarkersRef.current.forEach((o) => o.setMap(null));
      rhMarkersRef.current.forEach((o) => o.setMap(null));
      if (!jeongbiLoadedRef.current) {
        jeongbiLoadedRef.current = true;
        loadJeongbiMarkers(map);
      } else {
        jeongbiVisibilityRef.current?.();
      }
    } else {
      jeongbiMarkersRef.current.forEach((m) => m.setMap(null));
      jeongbiGuMarkersRef.current.forEach((m) => m.setMap(null));
      jeongbiPolygonsRef.current.forEach((p) => p.setMap(null));
      updateVisibilityRef.current?.();
      storeMarkersRef.current.forEach((o) => o.setMap(map));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showJeongbi]);

  async function loadPropertyMarkers(
    apiPath: string,
    color: string,
    propertyType: "offi" | "rh",
    markersRef: React.MutableRefObject<KakaoCustomOverlay[]>,
    map: KakaoMapInstance
  ) {
    const { kakao } = window;
    try {
      const res = await fetch(apiPath);
      const list: { aptNm: string; umdNm: string }[] = await res.json();
      const ps = new kakao.maps.services.Places();
      const BATCH = 5;
      for (let i = 0; i < list.length; i += BATCH) {
        await Promise.all(
          list.slice(i, i + BATCH).map(
            (item) =>
              new Promise<void>((resolve) => {
                const posOverride = propertyType === "offi" ? OFFI_POS_OVERRIDES[item.aptNm] : undefined;
                const query = `부산 강서구 ${item.umdNm ? item.umdNm + " " : ""}${item.aptNm}`;
                const place = (lat: number, lng: number, address: string) => {
                  const displayName = propertyType === "offi"
                    ? (OFFI_SHORT_NAMES[item.aptNm] ?? item.aptNm)
                    : (RH_SHORT_NAMES[item.aptNm] ?? item.aptNm);
                  const pin = document.createElement("div");
                  pin.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;";
                  pin.innerHTML = `
                    <div style="background:${color};color:#fff;font-size:11px;font-weight:700;
                      padding:4px 8px;border-radius:6px;white-space:nowrap;
                      box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);
                      transition:transform 0.15s,box-shadow 0.15s;"
                      onmouseover="this.style.transform='scale(1.18)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
                      onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.5)';">
                      ${displayName}
                    </div>
                    <div style="width:0;height:0;border-left:6px solid transparent;
                      border-right:6px solid transparent;border-top:8px solid ${color};"></div>`;
                  pin.addEventListener("click", (e) => {
                    e.stopPropagation();
                    setSelectedAptRef.current?.(null);
                    setSelectedStoreRef.current?.(null);
                    setSelectedSubscriptionRef.current?.(null);
                    const property = { name: item.aptNm, umdNm: item.umdNm, address, propertyType };
                    setSelectedPropertyRef.current?.(property);
                    openPropertyPopup(property, lat, lng, color, map);
                    map.setCenter(new kakao.maps.LatLng(lat, lng));
                  });
                  const overlay = new kakao.maps.CustomOverlay({ position: new kakao.maps.LatLng(lat, lng), content: pin, yAnchor: 1, zIndex: 2 });
                  overlay.setMap(map.getLevel() >= ZOOM_THRESHOLD ? null : map);
                  markersRef.current.push(overlay);
                  resolve();
                };
                if (posOverride) {
                  place(posOverride.lat, posOverride.lng, `부산 강서구 ${item.umdNm}`);
                } else {
                  ps.keywordSearch(query, (result, status) => {
                    if (status === kakao.maps.services.Status.OK && result[0]) {
                      const lat = parseFloat(result[0].y);
                      const lng = parseFloat(result[0].x);
                      const address = result[0].road_address_name || result[0].address_name || `부산 강서구 ${item.umdNm}`;
                      place(lat, lng, address);
                    } else {
                      resolve();
                    }
                  }, { size: 1 });
                }
              })
          )
        );
      }
    } catch (e) {
      console.error(`[${propertyType}] 마커 로딩 실패`, e);
    }
  }

  function loadOffiMarkers(map: KakaoMapInstance) {
    return loadPropertyMarkers("/api/offi-complexes", "#fb923c", "offi", offiMarkersRef, map);
  }

  function loadRhMarkers(map: KakaoMapInstance) {
    return loadPropertyMarkers("/api/rh-complexes", "#14b8a6", "rh", rhMarkersRef, map);
  }

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
    setSelectedSubscriptionRef.current?.(null);
    setSelectedPropertyRef.current?.(null);
    setSelectedJeongbiRef.current?.(null);
    setSharedArea("");
  }

  async function loadJeongbiMarkers(map: KakaoMapInstance) {
    const { kakao } = window;
    setJeongbiLoading(true);
    try {
      const res = await fetch("/api/jeongbi");
      const data = await res.json();
      const items: JeongbiProject[] = data.items ?? [];
      const completedNames: string[] = data.completedNames ?? [];

      const normalizeJeongbiName = (n: string) =>
        n.replace(/[\s]/g, "").replace(/정비구역|재개발|재건축|도시환경정비|주거환경개선|주거환경관리|가로주택정비|소규모재건축|사업|주택|구역|지구/g, "");
      const normalizedCompleted = completedNames.map(normalizeJeongbiName).filter(Boolean);
      const isCompletedPoly = (polyName: string) => {
        if (!polyName || polyName.length < 2) return false;
        const norm = normalizeJeongbiName(polyName);
        return normalizedCompleted.some((c) => norm.includes(c) || c.includes(norm));
      };
      const geocoder = new kakao.maps.services.Geocoder();

      const placeMarker = (item: JeongbiProject, lat: number, lng: number) => {
        const color = JEONGBI_TYPE_COLOR[item.type];
        const icon = JEONGBI_TYPE_ICON[item.type];

        const pin = document.createElement("div");
        pin.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
        pin.innerHTML = `
          <div style="background:${color};color:#fff;font-size:11px;font-weight:700;
            padding:4px 8px;border-radius:6px;white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);
            transition:transform 0.15s,box-shadow 0.15s;"
            onmouseover="this.style.transform='scale(1.18)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
            onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.5)';">
            ${icon} ${item.name} ${item.type}
          </div>
          <div style="width:0;height:0;border-left:6px solid transparent;
            border-right:6px solid transparent;border-top:8px solid ${color};"></div>`;

        pin.addEventListener("click", (e) => {
          if (isHandlingMarkerClickRef.current) return;
          isHandlingMarkerClickRef.current = true;
          setTimeout(() => { isHandlingMarkerClickRef.current = false; }, 50);
          e.stopPropagation();
          hidePopupOverlay();
          setSelectedAptRef.current?.(null);
          setSelectedStoreRef.current?.(null);
          setSelectedSubscriptionRef.current?.(null);
          setSelectedPropertyRef.current?.(null);
          setSelectedJeongbiRef.current?.(item);
        });

        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(lat, lng),
          content: pin,
          yAnchor: 1,
          zIndex: 3,
        });
        overlay.setMap(map);
        jeongbiMarkersRef.current.push(overlay);
      };

      const ps = new kakao.maps.services.Places();
      const guPositions = new Map<string, { lats: number[]; lngs: number[] }>();

      const placeMarkerWithTracking = (item: JeongbiProject, lat: number, lng: number) => {
        placeMarker(item, lat, lng);
        if (item.gu) {
          const entry = guPositions.get(item.gu) ?? { lats: [], lngs: [] };
          entry.lats.push(lat);
          entry.lngs.push(lng);
          guPositions.set(item.gu, entry);
        }
      };

      const searchByKeyword = (item: JeongbiProject, resolve: () => void) => {
        const query = `부산 ${item.gu ? item.gu + " " : ""}${item.name}`;
        ps.keywordSearch(query, (results, st) => {
          if (st === kakao.maps.services.Status.OK && results[0]) {
            placeMarkerWithTracking(item, parseFloat(results[0].y), parseFloat(results[0].x));
          }
          resolve();
        }, { size: 1 });
      };

      const BATCH = 10;
      for (let i = 0; i < items.length; i += BATCH) {
        await Promise.all(
          items.slice(i, i + BATCH).map((item) => {
            if (item.lat && item.lng) {
              placeMarkerWithTracking(item, item.lat, item.lng);
              return Promise.resolve();
            }
            return new Promise<void>((resolve) => {
              if (!item.address) { resolve(); return; }
              geocoder.addressSearch(item.address, (result, status) => {
                if (status === kakao.maps.services.Status.OK && result[0]) {
                  placeMarkerWithTracking(item, parseFloat(result[0].y), parseFloat(result[0].x));
                }
                resolve();
              });
            });
          })
        );
      }

      guPositions.forEach(({ lats, lngs }, gu) => {
        const centLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

        const pin = document.createElement("div");
        pin.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
        pin.innerHTML = `
          <div style="background:#7f1d1d;color:#fff;font-size:13px;font-weight:800;
            padding:6px 14px;border-radius:8px;white-space:nowrap;
            box-shadow:0 3px 12px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.25);
            transition:transform 0.15s,box-shadow 0.15s;"
            onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.6)';"
            onmouseout="this.style.transform='';this.style.boxShadow='0 3px 12px rgba(0,0,0,0.5)';">
            🏚️ ${gu}
          </div>
          <div style="width:0;height:0;border-left:8px solid transparent;
            border-right:8px solid transparent;border-top:10px solid #7f1d1d;"></div>`;

        pin.addEventListener("click", () => {
          map.setCenter(new kakao.maps.LatLng(centLat, centLng));
          map.setLevel(ZOOM_THRESHOLD - 1);
        });

        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(centLat, centLng),
          content: pin,
          yAnchor: 1,
          zIndex: 4,
        });
        overlay.setMap(null);
        jeongbiGuMarkersRef.current.push(overlay);
      });

      // 정비구역 GeoJSON 폴리곤
      try {
        const polyRes = await fetch("/jeongbi-busan-wgs84.geojson");
        const geojson = await polyRes.json();
        for (const feature of geojson.features) {
          const props = feature.properties as { name: string; type: string };
          if (isCompletedPoly(props.name ?? "")) continue;
          const color = JEONGBI_POLY_COLOR[props.type] ?? JEONGBI_POLY_COLOR["기타"];
          const coords = feature.geometry.coordinates as [number, number][][];
          const path = coords.map((ring) => ring.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng)));
          const polygon = new kakao.maps.Polygon({
            path,
            strokeWeight: 1.5,
            strokeColor: color,
            strokeOpacity: 0.9,
            fillColor: color,
            fillOpacity: 0.25,
            zIndex: 1,
          });
          polygon.setMap(map);
          jeongbiPolygonsRef.current.push(polygon);
        }
      } catch (e) {
        console.error("[정비구역] 폴리곤 로딩 실패", e);
      }

      const updateJeongbiVis = () => {
        if (!showJeongbiRef.current) return;
        const level = map.getLevel();
        const zoomed = level >= ZOOM_THRESHOLD;
        jeongbiMarkersRef.current.forEach((o) => o.setMap(zoomed ? null : map));
        jeongbiGuMarkersRef.current.forEach((o) => o.setMap(zoomed ? map : null));
        jeongbiPolygonsRef.current.forEach((p) => p.setMap(map));
      };
      jeongbiVisibilityRef.current = updateJeongbiVis;
      kakao.maps.event.addListener(map, "zoom_changed", updateJeongbiVis);
      updateJeongbiVis();
    } catch (e) {
      console.error("[정비사업] 마커 로딩 실패", e);
    } finally {
      setJeongbiLoading(false);
    }
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

  function openPropertyPopup(
    property: SelectedProperty,
    lat: number,
    lng: number,
    color: string,
    map: KakaoMapInstance
  ) {
    hidePopupOverlay();

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
    badge.textContent = property.umdNm || "강서구";
    badge.style.cssText = `display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;margin-bottom:6px;background:${color}33;color:${color};`;

    const name = document.createElement("div");
    name.textContent = property.name;
    name.style.cssText = "color:#fff;font-size:13px;font-weight:700;margin-bottom:3px;padding-right:20px;";

    const addr = document.createElement("div");
    addr.textContent = property.address;
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
      position: new kakao.maps.LatLng(lat, lng),
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
    storeMarkersRef.current.push(overlay);
  }

  function getSubStatus(item: SubscriptionItem): "active" | "upcoming" | "closed" {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const b = (item.RCEPT_BGNDE ?? "").replace(/-/g, "").slice(0, 8);
    const e = (item.RCEPT_ENDDE ?? "").replace(/-/g, "").slice(0, 8);
    if (!b) return "closed";
    if (today < b) return "upcoming";
    if (!e || today <= e) return "active";
    return "closed";
  }

  async function loadSubscriptionMarkers(map: KakaoMapInstance) {
    const { kakao } = window;
    setSubscriptionLoading(true);
    try {
      const res = await fetch("/api/subscription");
      const data = await res.json();
      const items: SubscriptionItem[] = data.items ?? [];
      const geocoder = new kakao.maps.services.Geocoder();

      const COLOR = { active: "#10b981", upcoming: "#3b82f6", closed: "#6b7280" };
      const ADDR_OVERRIDE: Record<string, string> = {
        "에코델타시티 엘가 로제비앙": "부산광역시 강서구 강동동 4588-3",
      };
      const MUNORWI_COLOR = "#9333ea";

      await Promise.all(
        items.map(
          (item) =>
            new Promise<void>((resolve) => {
              if (!item.HSSPLY_ADRES) { resolve(); return; }

              // 1차: 오버라이드 주소, 2차: "일원/일대/외" 제거, 3차: 동 단위까지만 축약
              const addr1 = ADDR_OVERRIDE[item.HOUSE_NM] ?? item.HSSPLY_ADRES.replace(/\s*(일원|일대|외)\s*$/, "").trim();
              const dongMatch = addr1.match(/^(부산광역시\s+\S+[구군]\s+\S+[동읍면리])/);
              const addr2 = dongMatch ? dongMatch[1] : null;

              const placeMarker = (lat: number, lng: number) => {
                const isMunorwi = item.kind === "munorwi";
                const st = getSubStatus(item);
                const color = isMunorwi && st !== "closed" ? MUNORWI_COLOR : COLOR[st];
                const label = isMunorwi ? `🔄 ${item.HOUSE_NM}` : `🏗️ ${item.HOUSE_NM}`;

                const pin = document.createElement("div");
                pin.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
                pin.innerHTML = `
                  <div style="background:${color};color:#fff;font-size:11px;font-weight:700;
                    padding:4px 8px;border-radius:6px;white-space:nowrap;
                    box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);
                    transition:transform 0.15s,box-shadow 0.15s;"
                    onmouseover="this.style.transform='scale(1.18)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
                    onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.5)';">
                    ${label}
                  </div>
                  <div style="width:0;height:0;border-left:6px solid transparent;
                    border-right:6px solid transparent;border-top:8px solid ${color};"></div>`;

                pin.addEventListener("click", (e) => {
                  if (isHandlingMarkerClickRef.current) return;
                  isHandlingMarkerClickRef.current = true;
                  setTimeout(() => { isHandlingMarkerClickRef.current = false; }, 50);
                  e.stopPropagation();
                  hidePopupOverlay();
                  setSelectedAptRef.current?.(null);
                  setSelectedStoreRef.current?.(null);
                  setSelectedJeongbiRef.current?.(null);
                  setSelectedSubscriptionRef.current?.(item);
                });

                const overlay = new kakao.maps.CustomOverlay({
                  position: new kakao.maps.LatLng(lat, lng),
                  content: pin,
                  yAnchor: 1,
                  zIndex: 3,
                });
                overlay.setMap(map);
                subscriptionMarkersRef.current.push(overlay);
              };

              geocoder.addressSearch(addr1, (result, status) => {
                if (status === kakao.maps.services.Status.OK && result[0]) {
                  placeMarker(parseFloat(result[0].y), parseFloat(result[0].x));
                  resolve();
                } else if (addr2) {
                  geocoder.addressSearch(addr2, (result2, status2) => {
                    if (status2 === kakao.maps.services.Status.OK && result2[0]) {
                      placeMarker(parseFloat(result2[0].y), parseFloat(result2[0].x));
                    }
                    resolve();
                  });
                } else {
                  resolve();
                }
              });
            })
        )
      );
    } catch (e) {
      console.error("[분양정보] 로딩 실패", e);
    } finally {
      setSubscriptionLoading(false);
    }
  }

  function initMap(posOverrides: Record<string, { lat: number; lng: number }> = {}) {
    if (!containerRef.current) return;
    const { kakao } = window;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(REGION_CENTER.kukje.lat, REGION_CENTER.kukje.lng),
      level: REGION_CENTER.kukje.level,
    });
    mapRef.current = map;

    kakao.maps.event.addListener(map, "click", () => {
      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
        return;
      }
      hidePopupOverlay();
    });

    // ── 줌 레벨별 마커 가시성 ────────────────────────────────────────────────
    aptOverlaysRef.current = [];
    regionOverlaysRef.current = [];

    function updateVisibility() {
      if (showJeongbiRef.current) return;
      const level = map.getLevel();
      const zoomed = level >= ZOOM_THRESHOLD;
      aptOverlaysRef.current.forEach((o) => o.setMap(zoomed ? null : map));
      regionOverlaysRef.current.forEach((o) => o.setMap(showSubscriptionRef.current ? null : zoomed ? map : null));
      offiMarkersRef.current.forEach((o) => o.setMap(zoomed ? null : map));
      rhMarkersRef.current.forEach((o) => o.setMap(zoomed ? null : map));
    }
    updateVisibilityRef.current = updateVisibility;
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
          box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);
          transition:transform 0.15s,box-shadow 0.15s;"
          onmouseover="this.style.transform='scale(1.18)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
          onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.5)';">
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
      aptOverlaysRef.current.push(overlay);
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
          onmouseover="this.style.transform='scale(1.18)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
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
      regionOverlaysRef.current.push(overlay);
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

    // 오피스텔·연립다세대 마커 자동 로딩
    loadOffiMarkers(map);
    loadRhMarkers(map);

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
                            box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.2);
                            transition:transform 0.15s,box-shadow 0.15s;"
                            onmouseover="this.style.transform='scale(1.18)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.55)';"
                            onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.5)';">
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
                        aptOverlaysRef.current.push(overlay);
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
        selectedSubscription={selectedSubscription}
        selectedProperty={selectedProperty}
        selectedJeongbi={selectedJeongbi}
        onClose={closePopup}
        txPanelOpen={txPanelOpen}
        onToggleTxPanel={() => setTxPanelOpen((v) => !v)}
        sharedArea={sharedArea}
        onSharedAreaChange={setSharedArea}
        areaTypeMap={areaTypeMap}
      />

      <MapBottomSheet
        selectedApt={selectedApt}
        selectedStore={selectedStore}
        selectedSubscription={selectedSubscription}
        selectedProperty={selectedProperty}
        selectedJeongbi={selectedJeongbi}
        onClose={closePopup}
        areaTypeMap={areaTypeMap}
      />

      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0" />
        <MapTransactionPanel
          selectedApt={selectedApt}
          isOpen={txPanelOpen}
          onClose={() => setTxPanelOpen(false)}
          sharedArea={sharedArea}
          onAreaChange={setSharedArea}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg">
            <span className="text-gray-400 text-sm">지도 로딩 중...</span>
          </div>
        )}
        {loaded && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              onClick={() => { setShowSchoolZones((v) => !v); setShowSubscription(false); setShowJeongbi(false); }}
              disabled={schoolZoneLoading}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border shadow transition-colors ${
                showSchoolZones
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              {schoolZoneLoading ? "로딩 중..." : "🏫 학구도"}
            </button>
            <button
              onClick={() => { setShowSubscription((v) => !v); setShowJeongbi(false); setShowSchoolZones(false); }}
              disabled={subscriptionLoading}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border shadow transition-colors ${
                showSubscription
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              {subscriptionLoading ? "로딩 중..." : "🏗️ 분양정보"}
            </button>
            <button
              onClick={() => { setShowJeongbi((v) => !v); setShowSubscription(false); setShowSchoolZones(false); }}
              disabled={jeongbiLoading}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border shadow transition-colors ${
                showJeongbi
                  ? "bg-rose-500 text-white border-rose-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              {jeongbiLoading ? "로딩 중..." : "🏚️ 정비사업"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
