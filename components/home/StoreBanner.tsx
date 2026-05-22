/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, ImageOff } from "lucide-react";
import type { PromotionStore } from "@/lib/promotionStore";


function StoreCard({ store }: { store: PromotionStore }) {
  const photo = store.photos[0];
  return (
    <div className="flex-shrink-0 w-64 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-colors overflow-hidden">
      <div className="w-full aspect-video bg-bg-hover overflow-hidden">
        {photo ? (
          <img src={photo} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <ImageOff size={18} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white mb-1 truncate">{store.name}</p>
        <div className="flex items-center gap-1 text-xs text-muted">
          <MapPin size={10} />
          {store.region}
        </div>
      </div>
    </div>
  );
}

export default function StoreBanner() {
  const [stores, setStores] = useState<PromotionStore[]>([]);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (stores.length === 0) return null;

  // 화면을 가득 채울 만큼 복제한 뒤 2배로 늘려 무한 루프
  const minCopies = Math.max(1, Math.ceil(10 / stores.length));
  const base = Array.from({ length: minCopies }, () => stores).flat();
  const loopItems = [...base, ...base]; // 앞쪽 50% 재생 후 순간 리셋

  // 아이템 수에 비례해 속도 조정 (카드 1개당 10초)
  const duration = base.length * 10;

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">주변 추천 가게</h2>
            <p className="text-sm text-gray-400">입주 단지 주변 홍보 가게를 확인하세요</p>
          </div>
          <Link href="/store" className="text-sm text-accent hover:underline font-medium">
            전체보기 →
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 px-4"
          style={{
            width: "max-content",
            animation: `marquee ${duration}s linear infinite`,
          }}
        >
          {loopItems.map((s, i) => (
            <StoreCard key={i} store={s} />
          ))}
        </div>
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg to-transparent" />
      </div>
    </section>
  );
}
