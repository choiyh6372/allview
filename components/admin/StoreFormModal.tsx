/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { X, Upload, Trash2, Loader2 } from "lucide-react";
import { STORE_CATEGORIES, STORE_REGIONS, type PromotionStore } from "@/lib/promotionStore";

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
  category: STORE_CATEGORIES[0],
  region: STORE_REGIONS[0],
  photos: [],
};

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

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`파일 크기가 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB → 최대 10MB)`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
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
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative group">
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

  const photos = Array.from({ length: 5 }, (_, i) => form.photos[i] ?? "");

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div
        className="bg-bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-bold text-white">
            {isNew ? "새 가게 등록" : "가게 수정"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white p-1 rounded-lg hover:bg-bg-hover transition-colors"
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
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">업종 *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
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
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
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
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">전화번호</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="051-000-0000"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">네이버 플레이스 링크</label>
              <input
                value={form.naverUrl}
                onChange={(e) => setForm((p) => ({ ...p, naverUrl: e.target.value }))}
                placeholder="https://place.naver.com/..."
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
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
                      : "border border-border text-gray-400 hover:text-white hover:border-accent/40"
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
              사진 (최대 5장, 자동 4:3 크롭)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {photos.map((url, i) => (
                <ImageSlot
                  key={i}
                  index={i}
                  url={url}
                  storeId={storeId}
                  onUploaded={(newUrl) => setPhoto(i, newUrl)}
                  onRemove={() => removePhoto(i)}
                />
              ))}
            </div>
            <p className="text-xs text-muted mt-1.5">첫 번째 사진이 카드의 대표 사진으로 사용됩니다.</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border text-gray-400 hover:text-white hover:border-gray-500 rounded-xl text-sm font-medium transition-colors"
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
