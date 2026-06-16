/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Upload, Trash2, Loader2, MapPin, GripVertical, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { STORE_CATEGORIES, STORE_REGIONS, type PromotionStore, type BannerSlotConfig } from "@/lib/promotionStore";
import CropModal from "@/components/admin/CropModal";

interface Props {
  initial?: PromotionStore | null;
  onSave: (store: PromotionStore) => Promise<void>;
  onClose: () => void;
}

const EMPTY: Omit<PromotionStore, "createdAt" | "updatedAt"> = {
  id: "",
  name: "",
  address: "",
  phone: "",
  naverUrl: "",
  description: "",
  category: STORE_CATEGORIES[0],
  region: STORE_REGIONS[0],
  photos: [],
  bannerSlots: [],
};

const POSITION_LABELS: Record<BannerSlotConfig["position"], string> = {
  "real-estate": "실거래가",
  map: "지도",
};

const ALL_SLOTS: { position: BannerSlotConfig["position"]; slot: 1 | 2 }[] = [
  { position: "real-estate", slot: 1 },
  { position: "real-estate", slot: 2 },
  { position: "map", slot: 1 },
  { position: "map", slot: 2 },
];

interface BannerSlotRowProps {
  config: BannerSlotConfig;
  storeId: string;
  onUpdate: (updated: BannerSlotConfig) => void;
  onRemove: () => void;
}

function BannerSlotRow({ config, storeId, onUpdate, onRemove }: BannerSlotRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("storeId", storeId);
      fd.append("position", config.position);
      fd.append("slot", String(config.slot));
      const res = await fetch("/api/admin/banner-upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "업로드 실패");
      const { url } = await res.json();
      onUpdate({ ...config, imageUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-900">
          {POSITION_LABELS[config.position]} · 슬롯 {config.slot}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onUpdate({ ...config, active: !config.active })}>
            {config.active
              ? <ToggleRight size={20} className="text-green-400" />
              : <ToggleLeft size={20} className="text-gray-400" />}
          </button>
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div
        className="relative w-full h-20 rounded-lg overflow-hidden border border-dashed border-border cursor-pointer hover:border-accent/50 transition-colors bg-bg-hover"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {config.imageUrl ? (
          <img src={config.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted hover:text-accent/60 transition-colors">
            <Upload size={16} />
            <span className="text-xs">배너 이미지 (4:1 비율 권장)</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={18} className="text-accent animate-spin" />
          </div>
        )}
        {config.imageUrl && !uploading && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
            <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">클릭해서 교체</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface SlotProps {
  index: number;
  url: string;
  storeId: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}

function ImageSlot({ index, url, storeId, onUploaded, onRemove }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`파일 크기가 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB → 최대 10MB)`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다");
      return;
    }

    setError("");
    setCropSrc(URL.createObjectURL(file));
  }

  async function handleCropConfirm(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", blob, `photo-${Date.now()}.jpg`);
      form.append("storeId", storeId);
      form.append("index", index.toString());
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "업로드 실패");
      }
      const { url: newUrl } = await res.json();
      onUploaded(newUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  return (
    <div className="relative group">
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div
        className={`aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-colors ${
          url
            ? "border border-border"
            : "border-2 border-dashed border-border hover:border-accent/50"
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted hover:text-accent/60 transition-colors">
            <Upload size={18} />
            <span className="text-xs">{index === 0 ? "대표사진" : `사진 ${index + 1}`}</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
            <Loader2 size={22} className="text-accent animate-spin" />
          </div>
        )}
      </div>

      {url && !uploading && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-6 h-6 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center"
            title="교체"
          >
            <Upload size={11} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
            title="삭제"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-0.5 text-center">{error}</p>
      )}
    </div>
  );
}

const PROMOTION_DAYS = [10, 20, 30] as const;

function formatEndDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function StoreFormModal({ initial, onSave, onClose }: Props) {
  const isNew = !initial;
  const [storeId] = useState(() => initial?.id ?? generateId());
  const [form, setForm] = useState<Omit<PromotionStore, "createdAt" | "updatedAt">>(() =>
    initial ? { ...initial } : { ...EMPTY, id: storeId }
  );
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 미니맵 state
  const [showMap, setShowMap] = useState(() => !!(initial?.lat && initial?.lng));
  const [sdkReady, setSdkReady] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const miniMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const miniMapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const photos = Array.from({ length: 10 }, (_, i) => form.photos[i] ?? "");

  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function reorderPhotos(from: number, to: number) {
    if (from === to) return;
    const arr = Array.from({ length: 10 }, (_, i) => form.photos[i] ?? "");
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setForm(f => ({ ...f, photos: arr.filter(Boolean) }));
  }

  // Kakao SDK 로드
  useEffect(() => {
    fetch("/api/map-config")
      .then((r) => r.json())
      .then(({ kakaoKey }: { kakaoKey: string }) => {
        if (!kakaoKey) return;

        function onReady() {
          window.kakao.maps.load(() => setSdkReady(true));
        }

        if (window.kakao?.maps) {
          onReady();
          return;
        }

        const scriptId = "kakao-map-sdk";
        const existing = document.getElementById(scriptId);
        if (existing) {
          existing.addEventListener("load", onReady);
          return;
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
        script.onload = onReady;
        document.head.appendChild(script);
      });
  }, []);

  // showMap + sdkReady 둘 다 true가 되면 미니맵 초기화
  useEffect(() => {
    if (!showMap || !sdkReady || miniMapInstanceRef.current || !miniMapRef.current) return;

    const { kakao } = window;
    const initLat = form.lat ?? 35.1684;
    const initLng = form.lng ?? 128.9656;
    const center = new kakao.maps.LatLng(initLat, initLng);

    const map = new kakao.maps.Map(miniMapRef.current, { center, level: 3 });
    miniMapInstanceRef.current = map;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marker = new (kakao.maps as any).Marker({ position: center, draggable: true, map });
    markerRef.current = marker;

    // 드래그 끝날 때 좌표 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (kakao.maps as any).event.addListener(marker, "dragend", () => {
      const pos = marker.getPosition();
      setForm((p) => ({ ...p, lat: pos.getLat(), lng: pos.getLng() }));
    });

    // 저장된 좌표 없고 주소 있으면 자동 지오코딩
    if (!form.lat && !form.lng && form.address) {
      const geocoder = new kakao.maps.services.Geocoder();
      setGeocoding(true);
      geocoder.addressSearch(
        form.address,
        (result: Array<{ x: string; y: string }>, status: string) => {
          setGeocoding(false);
          if (status !== kakao.maps.services.Status.OK || !result[0]) return;
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          const pos = new kakao.maps.LatLng(lat, lng);
          marker.setPosition(pos);
          map.setCenter(pos);
          setForm((p) => ({ ...p, lat, lng }));
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap, sdkReady]);

  function geocodeAndMove() {
    const { kakao } = window;
    if (!kakao?.maps || !miniMapInstanceRef.current || !markerRef.current || !form.address) return;
    const geocoder = new kakao.maps.services.Geocoder();
    setGeocoding(true);
    geocoder.addressSearch(
      form.address,
      (result: Array<{ x: string; y: string }>, status: string) => {
        setGeocoding(false);
        if (status !== kakao.maps.services.Status.OK || !result[0]) return;
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
        const pos = new kakao.maps.LatLng(lat, lng);
        markerRef.current.setPosition(pos);
        miniMapInstanceRef.current.setCenter(pos);
        setForm((p) => ({ ...p, lat, lng }));
      }
    );
  }

  function setPhoto(index: number, url: string) {
    setForm((prev) => {
      const next = [...prev.photos];
      next[index] = url;
      return { ...prev, photos: next };
    });
  }

  function removePhoto(index: number) {
    setForm((prev) => {
      const next = [...prev.photos];
      next.splice(index, 1);
      return { ...prev, photos: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("가게명을 입력하세요"); return; }
    if (!form.address.trim()) { setError("주소를 입력하세요"); return; }
    if (isNew && !selectedDays) { setError("홍보 기간을 선택하세요"); return; }
    setSaving(true);
    setError("");
    try {
      let promotionEndDate = form.promotionEndDate;
      if (selectedDays) {
        const end = new Date();
        end.setDate(end.getDate() + selectedDays);
        end.setHours(23, 59, 59, 999);
        promotionEndDate = end.toISOString();
      }
      await onSave({
        ...form,
        id: storeId,
        photos: form.photos.filter(Boolean),
        promotionDays: selectedDays ?? form.promotionDays,
        promotionEndDate,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setError("저장 실패. 다시 시도하세요.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-bold text-gray-900">
            {isNew ? "새 가게 등록" : "가게 수정"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-gray-900 p-1 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1.5">가게명 *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="가게명을 입력하세요"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">업종 *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 focus:outline-none focus:border-accent/50 transition-colors"
              >
                {STORE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">지역 *</label>
              <select
                value={form.region}
                onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 focus:outline-none focus:border-accent/50 transition-colors"
              >
                {STORE_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1.5">주소 *</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="상세 주소를 입력하세요"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {/* 지도 위치 지정 */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted">지도 위치</label>
                {form.lat && form.lng && (
                  <span className="text-xs text-muted font-mono">
                    {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                  </span>
                )}
              </div>

              {!showMap ? (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="w-full py-2.5 border border-dashed border-border rounded-xl text-sm text-muted hover:text-gray-900 hover:border-accent/50 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin size={14} />
                  {form.lat && form.lng ? "지도에서 위치 수정" : "지도에서 위치 지정"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <div
                      ref={miniMapRef}
                      className="w-full h-52 rounded-xl overflow-hidden border border-border bg-bg-hover"
                    />
                    {(!sdkReady || geocoding) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-bg-hover/80 rounded-xl">
                        <Loader2 size={20} className="text-accent animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">핀을 드래그해 위치를 조정할 수 있습니다</p>
                    <button
                      type="button"
                      onClick={geocodeAndMove}
                      disabled={!sdkReady || !form.address || geocoding}
                      className="text-xs text-accent hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      주소로 이동
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">전화번호</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="051-000-0000"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">네이버 플레이스 링크</label>
              <input
                value={form.naverUrl}
                onChange={(e) => setForm((p) => ({ ...p, naverUrl: e.target.value }))}
                placeholder="https://place.naver.com/..."
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">가게 설명</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="가게 소개, 영업시간, 특징 등을 입력하세요"
                rows={3}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Promotion period */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              홍보 기간 {isNew && <span className="text-red-400">*</span>}
            </label>
            <div className="flex items-center gap-2">
              {PROMOTION_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSelectedDays(days)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedDays === days
                      ? "bg-accent text-white"
                      : "border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40"
                  }`}
                >
                  {days}일
                </button>
              ))}
            </div>
            {form.promotionEndDate && (
              <p className="text-xs text-muted mt-1.5">
                현재 종료일: <span className="text-gray-300">{formatEndDate(form.promotionEndDate)}</span>
                {selectedDays && <span className="text-accent ml-2">→ {selectedDays}일 연장 적용됨</span>}
              </p>
            )}
            {!form.promotionEndDate && !selectedDays && !isNew && (
              <p className="text-xs text-muted mt-1.5">기간 미설정 (계속 노출)</p>
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              사진 (최대 10장, 자동 4:3 크롭)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {photos.map((url, i) => (
                <div
                  key={i}
                  draggable={!!url}
                  onDragStart={() => { dragIndexRef.current = i; }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                  onDrop={() => {
                    if (dragIndexRef.current !== null) reorderPhotos(dragIndexRef.current, i);
                    dragIndexRef.current = null;
                    setDragOver(null);
                  }}
                  onDragEnd={() => { dragIndexRef.current = null; setDragOver(null); }}
                  className={`relative transition-opacity ${dragOver === i && dragIndexRef.current !== i ? "ring-2 ring-accent rounded-xl" : ""}`}
                >
                  {url && (
                    <div className="absolute top-1 left-1 z-10 cursor-grab text-white/70 hover:text-gray-900">
                      <GripVertical size={14} />
                    </div>
                  )}
                  <ImageSlot
                    index={i}
                    url={url}
                    storeId={storeId}
                    onUploaded={(newUrl) => setPhoto(i, newUrl)}
                    onRemove={() => removePhoto(i)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-1.5">첫 번째 사진이 카드의 대표 사진으로 사용됩니다.</p>
          </div>

          {/* Banner Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-muted">배너 광고 (선택)</label>
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  <Plus size={12} />
                  슬롯 추가
                </button>
                <div className="absolute right-0 top-5 z-10 hidden group-focus-within:block group-hover:block bg-bg-card border border-border rounded-xl shadow-lg py-1 w-36">
                  {ALL_SLOTS.filter(
                    (s) => !(form.bannerSlots ?? []).some(
                      (b) => b.position === s.position && b.slot === s.slot
                    )
                  ).map((s) => (
                    <button
                      key={`${s.position}-${s.slot}`}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-bg-hover hover:text-gray-900 transition-colors"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          bannerSlots: [
                            ...(f.bannerSlots ?? []),
                            { position: s.position, slot: s.slot, imageUrl: "", active: true },
                          ],
                        }))
                      }
                    >
                      {POSITION_LABELS[s.position]} · 슬롯 {s.slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(form.bannerSlots ?? []).length === 0 ? (
              <p className="text-xs text-muted py-2">배너 광고 없음</p>
            ) : (
              <div className="space-y-2">
                {(form.bannerSlots ?? []).map((config, i) => (
                  <BannerSlotRow
                    key={`${config.position}-${config.slot}`}
                    config={config}
                    storeId={storeId}
                    onUpdate={(updated) =>
                      setForm((f) => {
                        const next = [...(f.bannerSlots ?? [])];
                        next[i] = updated;
                        return { ...f, bannerSlots: next };
                      })
                    }
                    onRemove={() =>
                      setForm((f) => ({
                        ...f,
                        bannerSlots: (f.bannerSlots ?? []).filter((_, j) => j !== i),
                      }))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border text-gray-700 hover:text-gray-900 hover:border-gray-500 rounded-xl text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isNew ? "등록" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
