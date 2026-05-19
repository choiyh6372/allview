"use client";

import { useState } from "react";
import { stores, categories, regions } from "@/lib/storeData";
import StoreCard from "@/components/store/StoreCard";
import PromotionCTA from "@/components/store/PromotionCTA";
import { Search } from "lucide-react";

export default function StorePage() {
  const [region, setRegion] = useState("전체");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");

  const filtered = stores.filter((s) => {
    const matchRegion = region === "전체" || s.region === region;
    const matchCat = category === "전체" || s.category === category;
    const matchQ = !query || s.name.includes(query) || s.tags.some((t) => t.includes(query));
    return matchRegion && matchCat && matchQ;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">가게 홍보</h1>
        <p className="text-gray-400">입주 단지 주변 가게를 업종별·지역별로 탐색하세요</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="가게 이름 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Region filter */}
        <div>
          <p className="text-xs font-medium text-muted mb-2">지역</p>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
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

        {/* Category filter */}
        <div>
          <p className="text-xs font-medium text-muted mb-2">업종</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
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

      {/* Results count */}
      <p className="text-sm text-muted mb-5">
        {filtered.length}개 가게
      </p>

      {/* Store grid — 5 columns */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">검색 결과가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      )}

      <PromotionCTA />
    </div>
  );
}
