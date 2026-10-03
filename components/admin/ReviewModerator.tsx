"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, EyeOff, Trash2, RotateCcw } from "lucide-react";
import { complexData, getComplexFullName } from "@/lib/vrData";
import { formatReviewDate, type PublicReview, type ReviewStatus } from "@/lib/reviewUtils";

type AdminReview = PublicReview & { status: ReviewStatus };

const STATUS_LABEL: Record<ReviewStatus, string> = { pending: "승인 대기", approved: "공개 중", hidden: "숨김" };
const FILTERS: (ReviewStatus | "all")[] = ["pending", "approved", "hidden", "all"];

export default function ReviewModerator() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const complexName = (id: string) => {
    const c = complexData.find((x) => x.id === id);
    return c ? getComplexFullName(c) : id;
  };

  async function changeStatus(r: AdminReview, status: ReviewStatus) {
    setBusyId(r.id);
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complexId: r.complexId, id: r.id, status }),
    });
    if (res.ok) setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
    setBusyId(null);
  }

  async function remove(r: AdminReview) {
    if (!confirm("이 후기를 완전히 삭제하시겠습니까?")) return;
    setBusyId(r.id);
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complexId: r.complexId, id: r.id }),
    });
    if (res.ok) setReviews((prev) => prev.filter((x) => x.id !== r.id));
    setBusyId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  const shown = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const count = (s: ReviewStatus) => reviews.filter((r) => r.status === s).length;

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        단지 한줄 후기를 승인하면 해당 단지 페이지에 공개됩니다. 비방·광고·개인정보가 담긴 글은 숨기거나 삭제하세요.
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === f ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700"
            }`}
          >
            {f === "all" ? `전체 ${reviews.length}` : `${STATUS_LABEL[f]} ${count(f)}`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">해당하는 후기가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <li key={r.id} className="p-4 rounded-xl border border-border bg-bg-card">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-gray-900">{complexName(r.complexId)}</span>
                <span className="text-gray-700">{r.nickname}</span>
                <span className="text-muted">{formatReviewDate(r.createdAt)}</span>
                <span className={`ml-auto font-semibold ${r.status === "approved" ? "text-green-600" : r.status === "hidden" ? "text-muted" : "text-amber-600"}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-line break-words">{r.content}</p>
              <div className="mt-3 flex gap-2">
                {r.status !== "approved" && (
                  <button disabled={busyId === r.id} onClick={() => changeStatus(r, "approved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white disabled:opacity-50">
                    <Check size={13} /> 승인
                  </button>
                )}
                {r.status === "approved" && (
                  <button disabled={busyId === r.id} onClick={() => changeStatus(r, "hidden")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-gray-700 disabled:opacity-50">
                    <EyeOff size={13} /> 숨김
                  </button>
                )}
                {r.status === "hidden" && (
                  <button disabled={busyId === r.id} onClick={() => changeStatus(r, "pending")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-gray-700 disabled:opacity-50">
                    <RotateCcw size={13} /> 대기로
                  </button>
                )}
                <button disabled={busyId === r.id} onClick={() => remove(r)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-500/30 disabled:opacity-50">
                  <Trash2 size={13} /> 삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
