"use client";

import { useEffect, useState } from "react";
import { Home, Loader2, ExternalLink, Calendar, Users, MapPin, Building2 } from "lucide-react";
import StoreBanner from "@/components/home/StoreBanner";
import type { SubscriptionItem } from "@/app/api/subscription/route";

type Status = "all" | "active" | "upcoming" | "closed";

const STATUS_TABS: { key: Status; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "active", label: "청약중" },
  { key: "upcoming", label: "청약예정" },
  { key: "closed", label: "완료" },
];

// API가 YYYY-MM-DD 또는 YYYYMMDD 두 형식 모두 반환할 수 있으므로 정규화
function toCompact(date: string) {
  return date ? date.replace(/-/g, "").slice(0, 8) : "";
}

function getStatus(bgnde: string, endde: string): "active" | "upcoming" | "closed" {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const b = toCompact(bgnde);
  const e = toCompact(endde);
  if (!b) return "closed";
  if (today < b) return "upcoming";
  if (!e || today <= e) return "active";
  return "closed";
}

function formatDate(raw: string) {
  const d = toCompact(raw);
  if (!d || d.length < 8) return "-";
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
}

function formatMonth(raw: string) {
  const d = toCompact(raw);
  if (!d || d.length < 6) return "-";
  return `${d.slice(0, 4)}년 ${d.slice(4, 6)}월`;
}

const STATUS_STYLE = {
  active: "bg-emerald-500 text-white border-emerald-600",
  upcoming: "bg-blue-500 text-white border-blue-600",
  closed: "bg-gray-600 text-white border-gray-700",
};

const STATUS_LABEL = {
  active: "청약중",
  upcoming: "청약예정",
  closed: "완료",
};

const KIND_STYLE = "bg-purple-600 text-white border-purple-700";

export default function SubscriptionPage() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Status>("all");

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        if (data.error && !data.items?.length) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    if (tab === "all") return true;
    return getStatus(item.RCEPT_BGNDE, item.RCEPT_ENDDE) === tab;
  });

  const counts = {
    all: items.length,
    active: items.filter((i) => getStatus(i.RCEPT_BGNDE, i.RCEPT_ENDDE) === "active").length,
    upcoming: items.filter((i) => getStatus(i.RCEPT_BGNDE, i.RCEPT_ENDDE) === "upcoming").length,
    closed: items.filter((i) => getStatus(i.RCEPT_BGNDE, i.RCEPT_ENDDE) === "closed").length,
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 rounded-xl bg-bg-card text-orange-400">
            <Home size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">부산 분양정보</h1>
            <p className="text-sm text-muted mt-0.5">
              청약홈 아파트 분양 공고 · 최근 3개월
              {!loading && items.length > 0 && (
                <span className="ml-2">· 총 {items.length}건</span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-1.5 ${
                tab === t.key
                  ? "bg-accent text-white"
                  : "bg-bg-card border border-border text-gray-400 hover:text-white hover:border-accent/40"
              }`}
            >
              {t.label}
              {!loading && (
                <span
                  className={`text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                    tab === t.key ? "bg-white/20" : "bg-bg-hover"
                  }`}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-muted">
            <Home size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">분양정보를 불러올 수 없습니다.</p>
            <p className="text-xs mt-1 text-gray-600">API 키를 확인해주세요 (APPLYHOME_API_KEY)</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <Home size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">해당하는 분양 공고가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const status = getStatus(item.RCEPT_BGNDE, item.RCEPT_ENDDE);
              return (
                <SubscriptionCard key={item.HOUSE_MANAGE_NO || item.PBLANC_NO} item={item} status={status} />
              );
            })}
          </div>
        )}
      </div>
      <StoreBanner />
    </>
  );
}

function SubscriptionCard({
  item,
  status,
}: {
  item: SubscriptionItem;
  status: "active" | "upcoming" | "closed";
}) {
  return (
    <div
      className={`p-5 rounded-2xl bg-bg-card border transition-all ${
        status === "active"
          ? "border-emerald-500/30 hover:border-emerald-500/50"
          : status === "upcoming"
          ? "border-blue-500/30 hover:border-blue-500/50"
          : "border-border hover:border-border/60"
      } hover:-translate-y-0.5 duration-200`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center text-sm font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
            {item.kind === "munorwi" && (
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${KIND_STYLE}`}>
                무순위
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-white leading-snug line-clamp-2">
            {item.HOUSE_NM || "-"}
          </h2>
        </div>
        {item.PBLANC_URL && (
          <a
            href={item.PBLANC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-xs text-accent hover:underline font-medium mt-1"
          >
            청약홈
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {item.CNSTRCT_ENTRPS_NM && (
          <div className="flex items-center gap-2 text-gray-400">
            <Building2 size={13} className="shrink-0 text-muted" />
            <span className="truncate">{item.CNSTRCT_ENTRPS_NM}</span>
            {item.HOUSE_SECD_NM && (
              <span className="ml-auto shrink-0 text-xs text-muted border border-border px-1.5 py-0.5 rounded">
                {item.HOUSE_SECD_NM}
              </span>
            )}
          </div>
        )}

        {item.HSSPLY_ADRES && (
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin size={13} className="shrink-0 text-muted" />
            <span className="truncate text-xs">{item.HSSPLY_ADRES}</span>
          </div>
        )}

        {item.TOT_SUPLY_HSHLDCO && (
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={13} className="shrink-0 text-muted" />
            <span>{Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대</span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted mb-1 flex items-center gap-1">
            <Calendar size={11} />
            청약 접수
          </p>
          <p className="text-gray-300 font-medium">
            {formatDate(item.RCEPT_BGNDE)} ~ {formatDate(item.RCEPT_ENDDE)}
          </p>
        </div>
        <div>
          <p className="text-muted mb-1">당첨자 발표</p>
          <p className="text-gray-300 font-medium">{formatDate(item.PRZWNER_PRESNATN_DE)}</p>
        </div>
        {item.MVNIN_PREARNGE_YM && (
          <div>
            <p className="text-muted mb-1">입주 예정</p>
            <p className="text-gray-300 font-medium">{formatMonth(item.MVNIN_PREARNGE_YM)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
