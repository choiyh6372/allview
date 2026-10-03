"use client";

import { useState } from "react";
import { MessageSquareText, Loader2, CheckCircle, Trash2, PenLine } from "lucide-react";
import {
  AUTHOR_TYPE_LABEL,
  NICKNAME_MAX_LENGTH,
  REVIEW_MAX_LENGTH,
  formatReviewDate,
  validateReviewInput,
  type PublicReview,
  type ReviewAuthorType,
} from "@/lib/reviewUtils";

const PAGE_SIZE = 10;
const TYPE_STYLE: Record<ReviewAuthorType, string> = {
  resident: "bg-accent/10 text-accent",
  visitor: "bg-emerald-500/10 text-emerald-600",
  interest: "bg-amber-500/10 text-amber-600",
};

export default function ComplexReviews({
  complexId,
  complexName,
  reviews: initialReviews,
}: {
  complexId: string;
  complexName: string;
  reviews: PublicReview[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [form, setForm] = useState({ nickname: "", authorType: "" as ReviewAuthorType | "", content: "", password: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validateReviewInput(form);
    if (msg) return setError(msg);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, complexId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장에 실패했습니다.");
      setDone(true);
      setForm({ nickname: "", authorType: "", content: "", password: "", website: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null);
    const res = await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complexId, id, password: deletePw }),
    });
    const data = await res.json();
    if (!res.ok) return setDeleteError(data.error ?? "삭제에 실패했습니다.");
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
    setDeletePw("");
  }

  const inputClass =
    "w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-gray-900 placeholder:text-muted focus:outline-none focus:border-accent/50";

  return (
    <section id="reviews" className="mt-10 max-w-4xl mx-auto scroll-mt-24">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
        <MessageSquareText size={20} className="text-accent" />
        {complexName} 한줄 후기
        <span className="text-sm font-medium text-muted">{reviews.length}</span>
      </h2>

      <div className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">아직 후기가 없습니다. 첫 후기를 남겨주세요.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.slice(0, visible).map((r) => (
              <li key={r.id} className="py-3.5 first:pt-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${TYPE_STYLE[r.authorType]}`}>
                    {AUTHOR_TYPE_LABEL[r.authorType]}
                  </span>
                  <span className="font-semibold text-gray-800">{r.nickname}</span>
                  <span className="text-muted">{formatReviewDate(r.createdAt)}</span>
                  <button
                    onClick={() => { setDeletingId(deletingId === r.id ? null : r.id); setDeletePw(""); setDeleteError(null); }}
                    className="ml-auto text-muted hover:text-red-400"
                    aria-label="후기 삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">{r.content}</p>
                {deletingId === r.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="password"
                      value={deletePw}
                      onChange={(e) => setDeletePw(e.target.value)}
                      placeholder="작성 시 입력한 비밀번호"
                      className="flex-1 px-3 py-1.5 bg-bg border border-border rounded-lg text-xs"
                    />
                    <button onClick={() => handleDelete(r.id)} className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-500 font-semibold">
                      삭제
                    </button>
                    {deleteError && <span className="text-xs text-red-400">{deleteError}</span>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {reviews.length > visible && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="mt-3 w-full py-2 text-sm font-semibold text-gray-700 border border-border rounded-xl hover:border-accent/40"
          >
            후기 더보기
          </button>
        )}

        {/* 작성: 평소엔 버튼만, 누르면 폼 */}
        <div className="mt-5 pt-5 border-t border-border">
          {done ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle size={28} className="text-green-600" />
              <p className="text-sm font-semibold text-gray-900">후기가 접수되었습니다.</p>
              <p className="text-xs text-muted">관리자 확인 후 공개됩니다.</p>
              <button onClick={() => { setDone(false); setShowForm(false); }} className="mt-1 text-xs text-accent underline">
                닫기
              </button>
            </div>
          ) : !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-accent/40 text-accent text-sm font-semibold hover:bg-accent/5 transition-colors"
            >
              <PenLine size={15} /> 후기 쓰기
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">후기 남기기</p>
                <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="text-xs text-muted hover:text-gray-900">
                  취소
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AUTHOR_TYPE_LABEL) as ReviewAuthorType[]).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => update("authorType", t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      form.authorType === t ? "bg-accent text-white border-accent" : "border-border text-gray-700 hover:border-accent/40"
                    }`}
                  >
                    {AUTHOR_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
              <textarea
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                maxLength={REVIEW_MAX_LENGTH}
                rows={3}
                placeholder="관리 상태, 주차, 소음, 주변 환경 등 실제로 느낀 점을 짧게 남겨주세요."
                className={`${inputClass} resize-none`}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={form.nickname}
                  onChange={(e) => update("nickname", e.target.value)}
                  maxLength={NICKNAME_MAX_LENGTH}
                  placeholder="닉네임"
                  className={inputClass}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="삭제용 비밀번호 (4자 이상)"
                  className={inputClass}
                />
                {/* 스팸봇용 숨김 칸 */}
                <input
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted leading-relaxed">
                  {form.content.length}/{REVIEW_MAX_LENGTH}자 · 링크·전화번호 불가 · 비방·광고성 글은 공개되지 않습니다.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  등록
                </button>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
