"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, ExternalLink } from "lucide-react";
import type { NaverNewsItem } from "@/app/api/news/route";

function stripHtml(str: string) {
  return str.replace(/<[^>]*>/g, "");
}

function formatDate(pubDate: string) {
  const d = new Date(pubDate);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export default function NewsSection() {
  const [items, setItems] = useState<NaverNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?display=5")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-bg-card text-amber-400">
              <Newspaper size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">부동산 뉴스</h2>
              <p className="text-xs text-muted mt-0.5">부산 강서구 최신 소식</p>
            </div>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-1 text-sm text-accent hover:underline font-semibold"
          >
            전체보기 <ArrowRight size={14} />
          </Link>
        </div>

        <ul className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="h-10 bg-bg-hover rounded-xl animate-pulse" />
              ))
            : items.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.originallink || item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card border border-border hover:border-accent/40 hover:bg-bg-hover transition-all group"
                  >
                    <span className="shrink-0 text-xs font-bold text-accent w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                      {stripHtml(item.title)}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{formatDate(item.pubDate)}</span>
                    <ExternalLink size={12} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
                  </a>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
