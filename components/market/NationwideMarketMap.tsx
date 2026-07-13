"use client";

import { useEffect, useRef, useState } from "react";
import RegionIndexChart from "@/components/market/RegionIndexChart";

interface KakaoLatLng { getLat: () => number; getLng: () => number; }
interface KakaoLatLngBounds { extend: (latlng: KakaoLatLng) => void; }
interface KakaoMapInstance {
  setBounds: (bounds: KakaoLatLngBounds) => void;
  getLevel: () => number;
}
interface KakaoCustomOverlay { setMap: (map: KakaoMapInstance | null) => void; }
interface KakaoPolygon {
  setMap: (map: KakaoMapInstance | null) => void;
  setOptions: (opts: { fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number }) => void;
}
interface KakaoMaps {
  load: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: object) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  CustomOverlay: new (opts: object) => KakaoCustomOverlay;
  Polygon: new (opts: {
    path: KakaoLatLng[][];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    fillColor?: string;
    fillOpacity?: number;
    zIndex?: number;
  }) => KakaoPolygon;
  event: { addListener: (target: KakaoPolygon | KakaoMapInstance, type: string, cb: (e?: MouseEvent) => void) => void };
}

function getKakaoMaps(): KakaoMaps {
  return (window as unknown as { kakao: { maps: KakaoMaps } }).kakao.maps;
}

type Metric = "saleChange" | "jeonseChange";

interface RegionEntry {
  code: string;
  name: string;
  latest: number | null;
  series: { date: string; value: number }[];
}

interface GeoFeature {
  properties: { code: string; name: string };
  geometry: { type: string; coordinates: unknown };
}

interface WeeklyData {
  sido: Record<Metric, { updatedAt: string; nationwide: { latest: number }; regions: RegionEntry[] }>;
  sgg: Record<Metric, { updatedAt: string; regions: RegionEntry[] }>;
}

const METRIC_LABEL: Record<Metric, string> = {
  saleChange: "매매가격 증감률",
  jeonseChange: "전세가격 증감률",
};

// 이 레벨보다 확대(숫자가 작아짐)하면 시/군/구, 아니면 시/도
const ZOOM_THRESHOLD = 10;

function colorFor(value: number | null): string {
  if (value === null) return "#9ca3af";
  const clamped = Math.max(-0.2, Math.min(0.2, value));
  const t = Math.abs(clamped) / 0.2; // 0~1
  if (clamped >= 0) {
    const light = 92 - t * 50; // 92% ~ 42% (상승 → 빨강)
    return `hsl(4, 80%, ${light}%)`;
  }
  const light = 92 - t * 50; // 하락 → 파랑
  return `hsl(214, 80%, ${light}%)`;
}

const SIDO_CODE_TO_NAME: Record<string, string> = {
  "11": "서울", "21": "부산", "22": "대구", "23": "인천", "24": "광주",
  "25": "대전", "26": "울산", "29": "세종", "31": "경기", "32": "강원",
  "33": "충북", "34": "충남", "35": "전북", "36": "전남", "37": "경북",
  "38": "경남", "39": "제주",
};

// 경기도는 서울을 감싸는 형태라 바운딩박스 중심이 서울과 거의 겹침 → 라벨을 남쪽으로 살짝 이동
const SIDO_LABEL_OFFSET: Record<string, { lat: number; lng: number }> = {
  "31": { lat: -0.35, lng: 0 },
  "23": { lat: 0, lng: 0.5 },
};

// 시/군/구 이름만으로는 어느 시/도 소속인지 알 수 없는 경우(예: "중구"는 서울·부산·대구 등에 모두 있음)를 보완해서 표시
// 시/도 자체의 코드(2자리, 예: 대구="22")는 이름이 이미 완전하므로 그대로 반환 —
// 그렇지 않으면 "대구"처럼 이름이 "구"로 끝나는 시/도가 자기 자신을 접두어로 잘못 붙여 "대구 대구"가 됨
function shortLabel(code: string, name: string): string {
  if (code.length <= 2) return name;
  const idx = name.lastIndexOf("시");
  if (idx > 0 && idx < name.length - 1) {
    // 예: 창원시진해구 → 창원시 진해구 (시 이름까지 그대로 보여줌)
    return `${name.slice(0, idx + 1)} ${name.slice(idx + 1)}`;
  }
  if (name.endsWith("구") || name.endsWith("군")) {
    // 예: 중구, 동구 등 광역시 직속 구/군 → 어느 시/도인지 코드로 판별해 앞에 표시
    const sidoName = SIDO_CODE_TO_NAME[code.slice(0, 2)];
    if (sidoName) return `${sidoName} ${name}`;
  }
  return name;
}

function fmtPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value}%`;
}

export default function NationwideMarketMap({ apiKey }: { apiKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const kakaoMapsRef = useRef<KakaoMaps | null>(null);

  const sidoPolygonsRef = useRef<Map<string, KakaoPolygon[]>>(new Map());
  const sidoLabelsRef = useRef<KakaoCustomOverlay[]>([]);
  const sidoValueElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const sidoBoundaryPolygonsRef = useRef<KakaoPolygon[]>([]);
  const sggPolygonsRef = useRef<Map<string, KakaoPolygon[]>>(new Map());
  const sggLabelsRef = useRef<KakaoCustomOverlay[]>([]);
  const sggValueElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const sggVisibleRef = useRef(false);
  const sidoGeoRef = useRef<GeoFeature[]>([]);
  const sggGeoRef = useRef<GeoFeature[]>([]);
  const weeklyDataRef = useRef<WeeklyData | null>(null);

  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [metric, setMetric] = useState<Metric>("saleChange");
  const [hovered, setHovered] = useState<RegionEntry | null>(null);
  const [selected, setSelected] = useState<{ level: "sido" | "sgg"; code: string; name: string } | null>(null);
  const [sidoSel, setSidoSel] = useState("");
  const [sggSel, setSggSel] = useState("");
  const metricRef = useRef(metric);
  metricRef.current = metric;

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;

    const scriptId = "kakao-map-sdk";
    const scriptReady = new Promise<void>((resolve) => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        // 다른 페이지(예: /map)에서 이미 같은 스크립트를 넣어둔 경우.
        // SDK 로딩이 실제로 끝났는지 확인하지 않으면 아직 로딩 중일 때 초기화가 조용히 실패할 수 있음.
        if ((window as unknown as { kakao?: { maps?: unknown } }).kakao?.maps) {
          resolve();
        } else {
          existing.addEventListener("load", () => resolve());
        }
        return;
      }
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

    const dataReady = fetch("/api/kb-weekly")
      .then((r) => r.json())
      .then((d: WeeklyData) => {
        if (cancelled) return;
        weeklyDataRef.current = d;
        setWeeklyData(d);
      });

    Promise.all([scriptReady, dataReady]).then(() => {
      if (cancelled) return;
      getKakaoMaps().load(initMap);
    });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setValueElText(valueEl: HTMLElement, value: number | null) {
    valueEl.style.color = value === null ? "#d1d5db" : value >= 0 ? "#f87171" : "#60a5fa";
    valueEl.textContent = fmtPercent(value);
  }

  function makeLabel(
    kakaoMaps: KakaoMaps,
    lat: number,
    lng: number,
    name: string,
    value: number | null,
    big: boolean,
    onClick?: () => void
  ) {
    const el = document.createElement("div");
    el.style.cssText = `display:flex;flex-direction:column;align-items:center;background:rgba(15,17,23,0.78);border-radius:6px;padding:${big ? "3px 7px" : "2px 5px"};white-space:nowrap;${onClick ? "cursor:pointer;" : "pointer-events:none;"}`;
    const nameEl = document.createElement("div");
    nameEl.style.cssText = `color:#fff;font-size:${big ? 13 : 12}px;font-weight:700;line-height:1.3;`;
    nameEl.textContent = name;
    const valueEl = document.createElement("div");
    valueEl.style.cssText = `font-size:${big ? 12 : 11}px;font-weight:700;line-height:1.3;`;
    setValueElText(valueEl, value);
    el.append(nameEl, valueEl);
    if (onClick) el.addEventListener("click", onClick);
    const overlay = new kakaoMaps.CustomOverlay({ position: new kakaoMaps.LatLng(lat, lng), content: el, zIndex: 2 });
    return { overlay, valueEl };
  }

  function buildPaths(
    kakaoMaps: KakaoMaps,
    feature: GeoFeature,
    bounds: KakaoLatLngBounds | null
  ): { paths: KakaoLatLng[][][]; centroid: { lat: number; lng: number } } {
    const subPolygons: [number, number][][][] =
      feature.geometry.type === "MultiPolygon"
        ? (feature.geometry.coordinates as [number, number][][][])
        : [feature.geometry.coordinates as [number, number][][]];

    const allLats: number[] = [];
    const allLngs: number[] = [];
    const paths = subPolygons.map((subPoly) =>
      subPoly.map((ring) =>
        ring.map(([lng, lat]) => {
          bounds?.extend(new kakaoMaps.LatLng(lat, lng));
          allLats.push(lat);
          allLngs.push(lng);
          return new kakaoMaps.LatLng(lat, lng);
        })
      )
    );

    return {
      paths,
      centroid: {
        lat: (Math.min(...allLats) + Math.max(...allLats)) / 2,
        lng: (Math.min(...allLngs) + Math.max(...allLngs)) / 2,
      },
    };
  }

  function renderFeature(
    kakaoMaps: KakaoMaps,
    map: KakaoMapInstance,
    feature: GeoFeature,
    region: RegionEntry | undefined,
    bounds: KakaoLatLngBounds | null,
    big: boolean,
    level: "sido" | "sgg"
  ): { polygons: KakaoPolygon[]; label: KakaoCustomOverlay | null; valueEl: HTMLElement | null } {
    const { paths, centroid } = buildPaths(kakaoMaps, feature, bounds);

    const polygons: KakaoPolygon[] = paths.map((path) => {
      const polygon = new kakaoMaps.Polygon({
        path,
        strokeWeight: 1.5,
        strokeColor: "#ffffff",
        strokeOpacity: 0.9,
        fillColor: colorFor(region?.latest ?? null),
        fillOpacity: 0.85,
        zIndex: 1,
      });
      kakaoMaps.event.addListener(polygon, "mouseover", () => {
        if (region) setHovered(region);
      });
      kakaoMaps.event.addListener(polygon, "mouseout", () => setHovered(null));
      kakaoMaps.event.addListener(polygon, "click", () => {
        if (region) setSelected({ level, code: region.code, name: region.name });
      });
      return polygon;
    });

    let label: KakaoCustomOverlay | null = null;
    let valueEl: HTMLElement | null = null;
    if (region) {
      const offset = level === "sido" ? SIDO_LABEL_OFFSET[region.code] : undefined;
      const labelLat = centroid.lat + (offset?.lat ?? 0);
      const labelLng = centroid.lng + (offset?.lng ?? 0);
      const made = makeLabel(kakaoMaps, labelLat, labelLng, shortLabel(region.code, region.name), region.latest, big, () =>
        setSelected({ level, code: region.code, name: region.name })
      );
      label = made.overlay;
      valueEl = made.valueEl;
    }

    return { polygons, label, valueEl };
  }

  function renderBoundaryOnly(kakaoMaps: KakaoMaps, feature: GeoFeature): KakaoPolygon[] {
    const { paths } = buildPaths(kakaoMaps, feature, null);
    return paths.map(
      (path) =>
        new kakaoMaps.Polygon({
          path,
          strokeWeight: 2,
          strokeColor: "#374151",
          strokeOpacity: 0.9,
          fillColor: "#000000",
          fillOpacity: 0,
          zIndex: 3,
        })
    );
  }

  function applyZoomVisibility() {
    const map = mapRef.current;
    if (!map) return;
    const zoomedIn = map.getLevel() <= ZOOM_THRESHOLD;
    if (zoomedIn === sggVisibleRef.current) return;
    sggVisibleRef.current = zoomedIn;

    sidoPolygonsRef.current.forEach((polys) => polys.forEach((p) => p.setMap(zoomedIn ? null : map)));
    sidoLabelsRef.current.forEach((l) => l.setMap(zoomedIn ? null : map));
    sidoBoundaryPolygonsRef.current.forEach((p) => p.setMap(zoomedIn ? map : null));
    sggPolygonsRef.current.forEach((polys) => polys.forEach((p) => p.setMap(zoomedIn ? map : null)));
    sggLabelsRef.current.forEach((l) => l.setMap(zoomedIn ? map : null));
  }

  async function initMap() {
    const kakaoMaps = getKakaoMaps();
    const data = weeklyDataRef.current;
    kakaoMapsRef.current = kakaoMaps;
    if (!containerRef.current || !data) return;

    const map = new kakaoMaps.Map(containerRef.current, {
      center: new kakaoMaps.LatLng(36.4, 127.9),
      level: 13,
      maxLevel: 13,
      minLevel: 8,
    });
    mapRef.current = map;

    const [sidoRes, sggRes] = await Promise.all([
      fetch("/skorea-provinces.geojson"),
      fetch("/skorea-municipalities.geojson"),
    ]);
    const sidoGeo = await sidoRes.json();
    const sggGeo = await sggRes.json();
    sidoGeoRef.current = sidoGeo.features;
    sggGeoRef.current = sggGeo.features;

    const bounds = new kakaoMaps.LatLngBounds();
    const sidoRegionByCode = new Map(data.sido[metricRef.current].regions.map((r) => [r.code, r]));

    for (const feature of sidoGeo.features as GeoFeature[]) {
      const region = sidoRegionByCode.get(feature.properties.code);
      const { polygons, label, valueEl } = renderFeature(kakaoMaps, map, feature, region, bounds, true, "sido");
      polygons.forEach((p) => p.setMap(map));
      label?.setMap(map);
      sidoPolygonsRef.current.set(feature.properties.code, polygons);
      if (label) sidoLabelsRef.current.push(label);
      if (valueEl) sidoValueElsRef.current.set(feature.properties.code, valueEl);

      const boundaryPolygons = renderBoundaryOnly(kakaoMaps, feature);
      sidoBoundaryPolygonsRef.current.push(...boundaryPolygons);
    }

    const sggRegionByCode = new Map(data.sgg[metricRef.current].regions.map((r) => [r.code, r]));
    for (const feature of sggGeo.features as GeoFeature[]) {
      const region = sggRegionByCode.get(feature.properties.code);
      if (!region) continue; // 매칭 데이터 없는 지역은 렌더링하지 않음
      const { polygons, label, valueEl } = renderFeature(kakaoMaps, map, feature, region, null, false, "sgg");
      // 시/군/구 폴리곤은 처음엔 숨김 (확대 시에만 표시)
      sggPolygonsRef.current.set(feature.properties.code, polygons);
      if (label) sggLabelsRef.current.push(label);
      if (valueEl) sggValueElsRef.current.set(feature.properties.code, valueEl);
    }

    sggVisibleRef.current = false;
    kakaoMaps.event.addListener(map, "zoom_changed", applyZoomVisibility);
    map.setBounds(bounds);
  }

  // 매매/전세 토글 시 색상·라벨 갱신
  useEffect(() => {
    const data = weeklyDataRef.current;
    if (!data) return;

    const sidoByCode = new Map(data.sido[metric].regions.map((r) => [r.code, r]));
    sidoPolygonsRef.current.forEach((polys, code) => {
      polys.forEach((p) => p.setOptions({ fillColor: colorFor(sidoByCode.get(code)?.latest ?? null) }));
    });
    sidoValueElsRef.current.forEach((valueEl, code) => {
      setValueElText(valueEl, sidoByCode.get(code)?.latest ?? null);
    });

    const sggByCode = new Map(data.sgg[metric].regions.map((r) => [r.code, r]));
    sggPolygonsRef.current.forEach((polys, code) => {
      polys.forEach((p) => p.setOptions({ fillColor: colorFor(sggByCode.get(code)?.latest ?? null) }));
    });
    sggValueElsRef.current.forEach((valueEl, code) => {
      setValueElText(valueEl, sggByCode.get(code)?.latest ?? null);
    });
  }, [metric, weeklyData]);

  // 지도 클릭으로 선택된 지역과 드롭다운 동기화
  useEffect(() => {
    if (!selected) {
      setSidoSel("");
      setSggSel("");
    } else if (selected.level === "sido") {
      setSidoSel(selected.code);
      setSggSel("");
    } else {
      setSidoSel(selected.code.slice(0, 2));
      setSggSel(selected.code);
    }
  }, [selected]);

  function zoomToRegion(level: "sido" | "sgg", code: string) {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;
    if (!kakaoMaps || !map) return;
    const geoList = level === "sido" ? sidoGeoRef.current : sggGeoRef.current;
    const feature = geoList.find((f) => f.properties.code === code);
    if (!feature) return;
    const bounds = new kakaoMaps.LatLngBounds();
    buildPaths(kakaoMaps, feature, bounds);
    map.setBounds(bounds);
  }

  function handleSidoSelect(code: string) {
    setSidoSel(code);
    setSggSel("");
    if (!code) {
      setSelected(null);
      return;
    }
    const region = weeklyData?.sido[metric].regions.find((r) => r.code === code);
    if (region) setSelected({ level: "sido", code: region.code, name: region.name });
    zoomToRegion("sido", code);
  }

  function handleSggSelect(code: string) {
    setSggSel(code);
    if (!code) {
      if (sidoSel) handleSidoSelect(sidoSel);
      return;
    }
    const region = weeklyData?.sgg[metric].regions.find((r) => r.code === code);
    if (region) setSelected({ level: "sgg", code: region.code, name: region.name });
    zoomToRegion("sgg", code);
  }

  const activeSido = weeklyData?.sido[metric];
  const sggOptions = weeklyData && sidoSel ? weeklyData.sgg[metric].regions.filter((r) => r.code.startsWith(sidoSel)) : [];

  return (
    <div className="relative w-full">
      {activeSido && (
        <div className="flex justify-end mb-4">
          <div className="text-sm text-gray-600">
            {activeSido.updatedAt} 기준 · 전국 평균{" "}
            <span className={activeSido.nationwide.latest >= 0 ? "text-red-500 font-semibold" : "text-blue-500 font-semibold"}>
              {fmtPercent(activeSido.nationwide.latest)}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="order-2 lg:order-2 lg:col-span-8">
          {weeklyData && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <select
                value={sidoSel}
                onChange={(e) => handleSidoSelect(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-bg-card border border-border text-gray-700"
              >
                <option value="">시/도 선택</option>
                {weeklyData.sido[metric].regions.map((r) => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              <select
                value={sggSel}
                onChange={(e) => handleSggSelect(e.target.value)}
                disabled={!sidoSel}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-bg-card border border-border text-gray-700 disabled:opacity-50"
              >
                <option value="">시/군/구 전체</option>
                {sggOptions.map((r) => (
                  <option key={r.code} value={r.code}>{shortLabel(r.code, r.name)}</option>
                ))}
              </select>
              {(["saleChange", "jeonseChange"] as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    metric === m ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {METRIC_LABEL[m]}
                </button>
              ))}
            </div>
          )}
          {selected ? (
            <RegionIndexChart
              level={selected.level}
              code={selected.code}
              name={shortLabel(selected.code, selected.name)}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="h-[80vh] flex items-center justify-center text-center rounded-2xl border border-border bg-bg-card">
              <p className="text-sm text-muted px-6">
                지도에서 지역을 클릭하면
                <br />
                최근 10년 매매·전세지수 그래프가 여기에 표시됩니다
              </p>
            </div>
          )}
        </div>

        {/* containerRef는 항상 마운트돼 있어야 함: weeklyData 로딩 완료 시점에 initMap이
            한 번만 호출되는데, 그때 이 div가 아직 DOM에 없으면 지도가 영영 초기화되지 않음 */}
        <div className="order-1 lg:order-1 lg:col-span-4 relative">
          <div ref={containerRef} className="w-full h-[80vh] rounded-2xl border border-border overflow-hidden" />

          {!weeklyData && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-border bg-bg-card text-sm text-muted">
              데이터 불러오는 중...
            </div>
          )}

          {hovered && (
            <div className="absolute top-4 right-4 bg-bg-card border border-border rounded-xl shadow-lg p-4 min-w-[180px] pointer-events-none">
              <div className="text-sm font-bold text-gray-900 mb-1">{shortLabel(hovered.code, hovered.name)}</div>
              <div className={`text-lg font-black ${(hovered.latest ?? 0) >= 0 ? "text-red-500" : "text-blue-500"}`}>
                {fmtPercent(hovered.latest)}
              </div>
              <div className="text-xs text-muted mt-1">전주 대비 {METRIC_LABEL[metric]}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
