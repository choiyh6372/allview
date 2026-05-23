/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Store, ImageOff } from "lucide-react";
import PromotionDetailModal from "@/components/store/PromotionDetailModal";
import type { PromotionStore } from "@/lib/promotionStore";

const CATEGORIES = ["전체", "카페", "음식점", "마트", "헬스", "약국", "미용", "키즈", "베이커리", "세탁", "병원", "학원", "기타"];
const REGIONS = ["전체", "오션시티", "국제신도시", "에코델타"];

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
  기타: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};


export default function StorePage() {
  const [stores, setStores] = useState<PromotionStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("전체");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PromotionStore | null>(null);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter((s) => {
    const matchRegion = region === "전체" || s.region === region;
    const matchCat = category === "전체" || s.category === category;
    const matchQ = !query || s.name.includes(query) || s.address.includes(query);
    return matchRegion && matchCat && matchQ;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">가게 홍보</h1>
        <p className="text-gray-400">입주 단지 주변 홍보 가게를 업종별·지역별로 탐색하세요</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="가게 이름, 주소 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-muted mb-2">지역</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  region === r
                    ? "bg-accent text-white"
                    : "bg-bg-card border border-border text-gray-400 hover:text-white hover:border-accent/40"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted mb-2">업종</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === c
                    ? "bg-accent text-white"
                    : "bg-bg-card border border-border text-gray-400 hover:text-white hover:border-accent/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <Store size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {stores.length === 0
              ? "아직 등록된 가게가 없습니다."
              : "검색 결과가 없습니다."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-5">{filtered.length}개 가게</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((store) => (
              <StorePhotoCard
                key={store.id}
                store={store}
                onClick={() => setSelected(store)}
              />
            ))}
          </div>
        </>
      )}

      {selected && (
        <PromotionDetailModal store={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function StorePhotoCard({
  store,
  onClick,
}: {
  store: PromotionStore;
  onClick: () => void;
}) {
  const catColor = categoryColors[store.category] ?? "bg-accent/10 text-accent border-accent/20";
  const photo = store.photos[0];

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Photo */}
      <div className="aspect-square relative bg-bg-hover overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={store.name}
            className="w-full h-full object-cover [image-orientation:from-image] group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <ImageOff size={24} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border bg-bg/80 backdrop-blur-sm ${catColor}`}>
            {store.category}
          </span>
        </div>
        {store.photos.length > 1 && (
          <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            +{store.photos.length - 1}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate">{store.name}</h3>
      </div>
    </div>
  );
}
