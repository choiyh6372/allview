/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff } from "lucide-react";
import type { PromotionStore } from "@/lib/promotionStore";

function StoreCard({ store, compact, onClick }: { store: PromotionStore; compact?: boolean; onClick?: () => void }) {
  const photo = store.photos[0];
  return (
    <div onClick={onClick} className={`flex-shrink-0 ${compact ? "w-36" : "w-64"} rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-colors overflow-hidden${onClick ? " cursor-pointer" : ""}`}>
      <div className={`w-full ${compact ? "h-20" : "aspect-video"} bg-bg-hover overflow-hidden`}>
        {photo ? (
          <img src={photo} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <ImageOff size={compact ? 14 : 18} />
          </div>
        )}
      </div>
      <div className={compact ? "p-2" : "p-3"}>
        <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-white truncate`}>{store.name}</p>
      </div>
    </div>
  );
}

export default function StoreBanner({ compact }: { compact?: boolean }) {
  const [stores, setStores] = useState<PromotionStore[]>([]);
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const posRef = useRef(0);         // 현재 translateX (음수 = 왼쪽으로 이동)
  const dragStartPosRef = useRef(0);
  const halfRef = useRef(0);        // 아이템 1세트 너비 (캐시)
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || stores.length === 0) return;

    const PX_PER_FRAME = 0.4;

    // 렌더 후 너비 측정
    halfRef.current = el.offsetWidth / 2;
    const half = halfRef.current;

    function tick() {
      if (!pausedRef.current && half > 0 && el) {
        posRef.current -= PX_PER_FRAME;
        if (posRef.current <= -half) posRef.current += half;
        el.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [stores]);

  function startDrag(clientX: number) {
    pausedRef.current = true;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = clientX;
    dragStartPosRef.current = posRef.current;
  }

  function doDrag(clientX: number) {
    if (!isDraggingRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = clientX - startXRef.current;
    if (Math.abs(dx) > 4) hasDraggedRef.current = true;
    const half = halfRef.current;
    if (!half) return;
    let next = dragStartPosRef.current + dx;
    if (next > 0) next -= half;
    else if (next <= -half) next += half;
    posRef.current = next;
    el.style.transform = `translateX(${next}px)`;
  }

  function endDrag() {
    isDraggingRef.current = false;
    setTimeout(() => {
      pausedRef.current = false;
      hasDraggedRef.current = false;
    }, 80);
  }

  if (stores.length === 0) return null;

  const minCopies = Math.max(1, Math.ceil(10 / stores.length));
  const base = Array.from({ length: minCopies }, () => stores).flat();
  const loopItems = [...base, ...base];

  return (
    <section className={compact ? "pt-1 pb-1 overflow-hidden" : "pt-16 pb-4 overflow-hidden"}>
      <div className={compact ? "px-4 mb-3 flex items-center justify-between" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"}>
        {compact ? (
          <p className="text-sm font-semibold text-white">주변 추천 가게</p>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">주변 추천 가게</h2>
            <p className="text-sm text-gray-400">입주 단지 주변 홍보 가게를 확인하세요</p>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 px-4 select-none"
          style={{ width: "max-content", cursor: "grab" }}
          onMouseDown={(e) => { startDrag(e.clientX); e.preventDefault(); }}
          onMouseMove={(e) => doDrag(e.clientX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onClickCapture={(e) => { if (hasDraggedRef.current) e.stopPropagation(); }}
          onTouchStart={(e) => startDrag(e.touches[0].clientX)}
          onTouchMove={(e) => doDrag(e.touches[0].clientX)}
          onTouchEnd={endDrag}
        >
          {loopItems.map((s, i) => (
            <StoreCard key={i} store={s} compact={compact} onClick={() => router.push(`/map?storeId=${s.id}`)} />
          ))}
        </div>
        <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r ${compact ? "from-white" : "from-bg"} to-transparent`} />
        <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l ${compact ? "from-white" : "from-bg"} to-transparent`} />
      </div>
    </section>
  );
}
