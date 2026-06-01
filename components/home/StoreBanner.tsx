/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff } from "lucide-react";
import type { PromotionStore } from "@/lib/promotionStore";

function StoreCard({ store, compact, onClick }: { store: PromotionStore; compact?: boolean; onClick?: () => void }) {
  const photo = store.photos[0];
  return (
    <div onClick={onClick} className={`flex-shrink-0 ${compact ? "w-36" : "w-52"} rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-colors overflow-hidden${onClick ? " cursor-pointer" : ""}`}>
      <div className={`w-full ${compact ? "h-20" : "aspect-[4/3]"} bg-bg-hover overflow-hidden`}>
        {photo ? (
          <img src={photo} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <ImageOff size={compact ? 14 : 18} />
          </div>
        )}
      </div>
      <div className={compact ? "p-2" : "p-2"}>
        <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-900 truncate`}>{store.name}</p>
      </div>
    </div>
  );
}

export default function StoreBanner({ compact }: { compact?: boolean }) {
  const [stores, setStores] = useState<PromotionStore[]>([]);
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  const pausedRef        = useRef(false);
  const posRef           = useRef(0);      // 현재 translateX
  const halfRef          = useRef(0);      // 아이템 1세트 너비
  const rafRef           = useRef<number | null>(null);
  const hasDraggedRef    = useRef(false);  // 클릭 방지용
  const startXRef        = useRef(0);
  const dragStartPosRef  = useRef(0);

  // 마우스
  const mouseDownRef     = useRef(false);

  // 터치 - 4px 초과 이동 시에만 드래그로 인식
  const touchDownRef     = useRef(false);
  const touchDragRef     = useRef(false);  // 임계값 통과 여부

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

  // ── 마우스: mousedown에서 바로 일시정지 ────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    mouseDownRef.current = true;
    hasDraggedRef.current = false;
    pausedRef.current = true;
    startXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
    e.preventDefault();
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!mouseDownRef.current) return;
    const el = trackRef.current;
    if (!el || !halfRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 4) hasDraggedRef.current = true;
    let next = dragStartPosRef.current + dx;
    const half = halfRef.current;
    if (next > 0) next -= half;
    else if (next <= -half) next += half;
    posRef.current = next;
    el.style.transform = `translateX(${next}px)`;
  }

  function onMouseUp() {
    mouseDownRef.current = false;
    setTimeout(() => { pausedRef.current = false; hasDraggedRef.current = false; }, 80);
  }

  // ── 터치: 4px 이상 수평 이동 시에만 드래그 시작 (미세 떨림 무시) ────────────
  function onTouchStart(e: React.TouchEvent) {
    touchDownRef.current = true;
    touchDragRef.current = false;
    hasDraggedRef.current = false;
    startXRef.current = e.touches[0].clientX;
    // auto-scroll은 아직 멈추지 않음
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!touchDownRef.current) return;
    const clientX = e.touches[0].clientX;

    if (!touchDragRef.current) {
      const dx = clientX - startXRef.current;
      if (Math.abs(dx) <= 4) return; // 임계값 미달 → 무시
      // 임계값 초과 → 드래그 시작
      touchDragRef.current = true;
      pausedRef.current = true;
      hasDraggedRef.current = true;
      dragStartPosRef.current = posRef.current; // 현재 auto-scroll 위치 기준
      startXRef.current = clientX;              // 기준점을 임계값 돌파 지점으로 재설정
    }

    const el = trackRef.current;
    if (!el || !halfRef.current) return;
    const dx = clientX - startXRef.current;
    const half = halfRef.current;
    let next = dragStartPosRef.current + dx;
    if (next > 0) next -= half;
    else if (next <= -half) next += half;
    posRef.current = next;
    el.style.transform = `translateX(${next}px)`;
  }

  function onTouchEnd() {
    touchDownRef.current = false;
    touchDragRef.current = false;
    setTimeout(() => { pausedRef.current = false; hasDraggedRef.current = false; }, 80);
  }

  if (stores.length === 0) return null;

  const minCopies = Math.max(1, Math.ceil(10 / stores.length));
  const base = Array.from({ length: minCopies }, () => stores).flat();
  const loopItems = [...base, ...base];

  return (
    <section className={compact ? "pt-1 pb-1 overflow-hidden" : "pt-16 pb-4 overflow-hidden"}>
      <div className={compact ? "px-4 mb-3 flex items-center justify-between" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"}>
        {compact ? (
          <p className="text-sm font-semibold text-gray-900">주변 추천 가게</p>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">주변 추천 가게</h2>
            <p className="text-sm text-gray-600">입주 단지 주변 홍보 가게를 확인하세요</p>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 px-4 select-none"
          style={{ width: "max-content", cursor: "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClickCapture={(e) => { if (hasDraggedRef.current) e.stopPropagation(); }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
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
