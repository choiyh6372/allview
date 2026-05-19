"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const stores = [
  { name: "오션카페", category: "카페", region: "오션시티", rating: 4.8 },
  { name: "에코마트", category: "마트", region: "에코델타", rating: 4.6 },
  { name: "국제헬스장", category: "헬스", region: "국제신도시", rating: 4.9 },
  { name: "바다횟집", category: "음식점", region: "오션시티", rating: 4.7 },
  { name: "그린약국", category: "약국", region: "에코델타", rating: 4.5 },
  { name: "스타일헤어", category: "미용", region: "국제신도시", rating: 4.8 },
  { name: "키즈카페 붕붕", category: "키즈", region: "에코델타", rating: 4.9 },
  { name: "오션빵집", category: "베이커리", region: "오션시티", rating: 4.7 },
  { name: "국제피자", category: "음식점", region: "국제신도시", rating: 4.6 },
  { name: "에코세탁소", category: "세탁", region: "에코델타", rating: 4.4 },
];

const categoryColors: Record<string, string> = {
  카페: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  마트: "bg-green-500/10 text-green-400 border-green-500/20",
  헬스: "bg-red-500/10 text-red-400 border-red-500/20",
  음식점: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  약국: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  미용: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  키즈: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  베이커리: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  세탁: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function StoreCard({ store }: { store: (typeof stores)[0] }) {
  const colorClass = categoryColors[store.category] ?? "bg-accent/10 text-accent border-accent/20";
  return (
    <div className="flex-shrink-0 w-44 p-4 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
          {store.category}
        </span>
        <span className="text-xs text-yellow-400 font-bold">★ {store.rating}</span>
      </div>
      <p className="text-sm font-semibold text-white mb-1 truncate">{store.name}</p>
      <div className="flex items-center gap-1 text-xs text-muted">
        <MapPin size={10} />
        {store.region}
      </div>
    </div>
  );
}

export default function StoreBanner() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const step = 0.5;
    const id = setInterval(() => {
      pos += step;
      if (pos >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
    }, 16);
    return () => clearInterval(id);
  }, []);

  const doubled = [...stores, ...stores];

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">주변 추천 가게</h2>
            <p className="text-sm text-gray-400">입주 단지 주변 인기 업종을 확인하세요</p>
          </div>
          <Link href="/store" className="text-sm text-accent hover:underline font-medium">
            전체보기 →
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex gap-4 px-4" ref={trackRef} style={{ width: "max-content" }}>
          {doubled.map((s, i) => (
            <StoreCard key={i} store={s} />
          ))}
        </div>
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg to-transparent" />
      </div>
    </section>
  );
}
