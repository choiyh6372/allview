/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Phone, ExternalLink } from "lucide-react";
import type { PromotionStore } from "@/lib/promotionStore";

const categoryColors: Record<string, string> = {
  카페: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  음식점: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  마트: "bg-green-500/10 text-green-400 border-green-500/20",
  헬스: "bg-red-500/10 text-red-400 border-red-500/20",
  약국: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  미용: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  키즈: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  베이커리: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  세탁: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  병원: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  학원: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const regionColors: Record<string, string> = {
  오션시티: "text-blue-400",
  국제신도시: "text-purple-400",
  에코델타: "text-green-400",
};

interface Props {
  store: PromotionStore;
  onClose: () => void;
}

export default function PromotionDetailModal({ store, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const photos = store.photos.filter(Boolean);
  const catColor = categoryColors[store.category] ?? "bg-accent/10 text-accent border-accent/20";
  const regColor = regionColors[store.region] ?? "text-muted";

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && photos.length > 1) setIdx((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight" && photos.length > 1) setIdx((i) => (i + 1) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${catColor}`}>
              {store.category}
            </span>
            <span className={`text-xs font-medium ${regColor}`}>{store.region}</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-bg-hover"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slideshow */}
        {photos.length > 0 ? (
          <div className="relative mx-4 rounded-xl overflow-hidden bg-bg-hover">
            <div className="aspect-[4/3]">
              <img
                src={photos[idx]}
                alt={`${store.name} 사진 ${idx + 1}`}
                className="w-full h-full object-cover [image-orientation:from-image]"
              />
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === idx ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
                  {idx + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mx-4 aspect-[4/3] rounded-xl bg-bg-hover flex items-center justify-center text-muted text-sm">
            사진 없음
          </div>
        )}

        {/* Info */}
        <div className="p-5 space-y-3">
          <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin size={14} className={`mt-0.5 flex-shrink-0 ${regColor}`} />
              <span className="leading-snug">{store.address}</span>
            </div>
            {store.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-muted" />
                <span>{store.phone}</span>
              </div>
            )}
          </div>

          {store.naverUrl && (
            <a
              href={store.naverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-[#03C75A]/10 hover:bg-[#03C75A]/20 border border-[#03C75A]/20 text-[#03C75A] rounded-xl text-sm font-semibold transition-colors"
            >
              <ExternalLink size={14} />
              네이버 플레이스에서 보기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
