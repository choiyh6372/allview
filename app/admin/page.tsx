/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Store, ImageOff, LogOut, MessageSquare, Phone, User, Calendar, MapPin, BarChart2, TrendingUp, Eye, Users, Video, Building2, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StoreFormModal from "@/components/admin/StoreFormModal";
import AptMapEditor from "@/components/admin/AptMapEditor";
import VRCountEditor from "@/components/admin/VRCountEditor";
import KbDataUpload from "@/components/admin/KbDataUpload";
import type { PromotionStore } from "@/lib/promotionStore";
import type { Inquiry } from "@/lib/inquiryStore";

function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function PromotionBadge({ endDate }: { endDate?: string }) {
  if (!endDate) return null;
  const remaining = getRemainingDays(endDate);
  if (remaining < 0)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">종료됨</span>;
  if (remaining === 0)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">오늘 종료</span>;
  if (remaining <= 3)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">{remaining}일 남음</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{remaining}일 남음</span>;
}

function formatEndDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const categoryColors: Record<string, string> = {
  카페: "bg-amber-500/10 text-amber-400",
  음식점: "bg-orange-500/10 text-orange-400",
  마트: "bg-green-500/10 text-green-400",
  헬스: "bg-red-500/10 text-red-400",
  약국: "bg-blue-500/10 text-blue-400",
  미용: "bg-pink-500/10 text-pink-400",
  키즈: "bg-purple-500/10 text-purple-400",
  베이커리: "bg-yellow-500/10 text-yellow-400",
  세탁: "bg-cyan-500/10 text-cyan-400",
  병원: "bg-sky-500/10 text-sky-400",
  학원: "bg-indigo-500/10 text-indigo-400",
};

type VisitStats = {
  today: number;
  yesterday: number;
  week: number;
  month: number;
  daily: { date: string; count: number }[];
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}<span className="text-sm font-normal text-muted ml-1">명</span></p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"stores" | "inquiries" | "apts" | "stats" | "vr" | "kb">("stores");
  const [stores, setStores] = useState<PromotionStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalStore, setModalStore] = useState<PromotionStore | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reactivateDays, setReactivateDays] = useState<Record<string, number>>({});
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<VisitStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores");
      const data = await res.json();
      setStores(Array.isArray(data) ? data : []);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch {
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      setAnalytics(await res.json());
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === "inquiries") loadInquiries();
    if (tab === "stats") loadAnalytics();
  }, [tab, loadInquiries, loadAnalytics]);

  async function handleDeleteInquiry(id: string) {
    if (!confirm("문의를 삭제하시겠습니까?")) return;
    setDeletingInquiryId(id);
    try {
      await fetch("/api/admin/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadInquiries();
    } finally {
      setDeletingInquiryId(null);
    }
  }

  async function handleSave(store: PromotionStore) {
    const isNew = !stores.find((s) => s.id === store.id);
    const res = await fetch(
      isNew ? "/api/admin/stores" : `/api/admin/stores/${store.id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      }
    );
    if (!res.ok) throw new Error();
    setModalStore(undefined);
    await load();
  }

  async function handleReactivate(store: PromotionStore) {
    const days = reactivateDays[store.id];
    if (!days) return;
    setReactivatingId(store.id);
    try {
      const end = new Date();
      end.setDate(end.getDate() + days);
      end.setHours(23, 59, 59, 999);
      await fetch(`/api/admin/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...store, promotionDays: days, promotionEndDate: end.toISOString() }),
      });
      setReactivateDays((prev) => { const next = { ...prev }; delete next[store.id]; return next; });
      await load();
    } finally {
      setReactivatingId(null);
    }
  }

  async function handleDelete(store: PromotionStore) {
    if (!confirm(`"${store.name}"을(를) 삭제하시겠습니까?\n사진도 함께 삭제됩니다.`)) return;
    setDeletingId(store.id);
    try {
      await fetch(`/api/admin/stores/${store.id}`, { method: "DELETE" });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">관리자</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2.5 border border-border text-gray-700 hover:text-gray-900 hover:border-gray-400 rounded-xl text-sm transition-colors"
          title="로그아웃"
        >
          <LogOut size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-card border border-border rounded-xl mb-8 w-fit">
        <button
          onClick={() => setTab("stores")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "stores" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
          }`}
        >
          <Store size={15} />
          가게홍보 관리
          <span className="text-xs opacity-70">{stores.length}</span>
        </button>
        <button
          onClick={() => setTab("inquiries")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "inquiries" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
          }`}
        >
          <MessageSquare size={15} />
          문의 관리
          {inquiries.length > 0 && (
            <span className="text-xs opacity-70">{inquiries.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab("apts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "apts" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
          }`}
        >
          <MapPin size={15} />
          아파트 핀 위치
        </button>
        <button
          onClick={() => setTab("vr")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "vr" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
          }`}
        >
          <Video size={15} />
          VR 평형수
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "stats" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
          }`}
        >
          <BarChart2 size={15} />
          방문자 통계
        </button>
        <button
          onClick={() => setTab("kb")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "kb" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
          }`}
        >
          <FileSpreadsheet size={15} />
          KB부동산 데이터
        </button>
        <button
          onClick={() => router.push("/admin/jeongbi")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-gray-900 transition-colors"
        >
          <Building2 size={15} />
          정비사업 데이터
        </button>
      </div>

      {/* Stores Tab */}
      {tab === "stores" && (
      <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">등록된 가게 {stores.length}개</p>
        <button
          onClick={() => setModalStore(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          새 가게 추가
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <Store size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">등록된 가게가 없습니다.</p>
          <p className="text-xs mt-1">위의 버튼으로 첫 가게를 추가하세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-bg-card border border-border rounded-2xl p-4 hover:border-accent/20 transition-colors"
            >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-bg-hover">
                {store.photos[0] ? (
                  <img
                    src={store.photos[0]}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageOff size={16} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{store.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      categoryColors[store.category] ?? "bg-accent/10 text-accent"
                    }`}
                  >
                    {store.category}
                  </span>
                  <PromotionBadge endDate={store.promotionEndDate} />
                </div>
                <p className="text-xs text-muted truncate">{store.region} · {store.address}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted">사진 {store.photos.length}장</span>
                  {store.promotionEndDate && (
                    <span className="text-xs text-muted">
                      종료 {formatEndDate(store.promotionEndDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setModalStore(store)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40 rounded-lg text-xs font-medium transition-colors"
                >
                  <Pencil size={12} />
                  수정
                </button>
                <button
                  onClick={() => handleDelete(store)}
                  disabled={deletingId === store.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {deletingId === store.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  삭제
                </button>
              </div>
            </div>

            {/* 재등록 행 - 만료된 가게만 */}
            {store.promotionEndDate && getRemainingDays(store.promotionEndDate) < 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted mr-1">재등록 기간:</span>
                {[10, 20, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setReactivateDays((prev) => ({ ...prev, [store.id]: days }))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      reactivateDays[store.id] === days
                        ? "bg-accent text-white"
                        : "border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40"
                    }`}
                  >
                    {days}일
                  </button>
                ))}
                <button
                  onClick={() => handleReactivate(store)}
                  disabled={!reactivateDays[store.id] || reactivatingId === store.id}
                  className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors"
                >
                  {reactivatingId === store.id ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : null}
                  재등록
                </button>
              </div>
            )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalStore !== undefined && (
        <StoreFormModal
          initial={modalStore}
          onSave={handleSave}
          onClose={() => setModalStore(undefined)}
        />
      )}
      </div>
      )}

      {/* VR Count Tab */}
      {tab === "vr" && (
        <div>
          <VRCountEditor />
        </div>
      )}

      {/* KB부동산 데이터 Tab */}
      {tab === "kb" && (
        <div>
          <KbDataUpload />
        </div>
      )}

      {/* Apt Pin Tab */}
      {tab === "apts" && (
        <div className="max-w-xl">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted">단지를 선택해 핀 위치를 드래그로 조정하세요</p>
          </div>
          <AptMapEditor />
        </div>
      )}

      {/* Stats Tab */}
      {tab === "stats" && (
        <div>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-24 text-muted">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="오늘" value={analytics.today} icon={<Eye size={18} />} />
                <StatCard label="어제" value={analytics.yesterday} icon={<Eye size={18} />} />
                <StatCard label="이번 주" value={analytics.week} icon={<TrendingUp size={18} />} />
                <StatCard label="이번 달" value={analytics.month} icon={<Users size={18} />} />
              </div>

              {/* Chart */}
              <div className="bg-bg-card border border-border rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">최근 30일 일별 방문자</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analytics.daily} barSize={10}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      interval={6}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      width={24}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: "#e5e7eb" }}
                      formatter={(v: number) => [`${v}명`, "방문자"]}
                      cursor={{ fill: "#5b6ef510" }}
                    />
                    <Bar dataKey="count" fill="#5b6ef5" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-end">
                <button onClick={loadAnalytics} className="text-xs text-muted hover:text-gray-900 transition-colors">
                  새로고침
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-24 text-muted text-sm">
              데이터를 불러오지 못했습니다.
            </div>
          )}
        </div>
      )}

      {/* Inquiries Tab */}
      {tab === "inquiries" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted">총 {inquiries.length}건</p>
            <button
              onClick={loadInquiries}
              className="text-xs text-muted hover:text-gray-900 transition-colors"
            >
              새로고침
            </button>
          </div>

          {inquiriesLoading ? (
            <div className="flex items-center justify-center py-24 text-muted">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-24 text-muted">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">접수된 문의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-bg-card border border-border rounded-2xl p-4 hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                          <User size={13} className="text-accent" />
                          {inq.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone size={12} />
                          {inq.phone}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted ml-auto">
                          <Calendar size={11} />
                          {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{inq.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      disabled={deletingInquiryId === inq.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {deletingInquiryId === inq.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
