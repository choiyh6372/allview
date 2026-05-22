"use client";

import { useState } from "react";
import { X, MessageSquare, Loader2, CheckCircle } from "lucide-react";

export default function InquiryModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleOpen() {
    setOpen(true);
    setDone(false);
    setError("");
    setForm({ name: "", phone: "", content: "" });
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.content.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }
      setDone(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-6 py-3 bg-bg-card hover:bg-bg-hover border border-border text-white font-semibold rounded-xl transition-colors text-sm"
      >
        문의하기
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-bg-card border border-border rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-accent" />
                <h2 className="text-base font-bold text-white">문의하기</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <CheckCircle size={40} className="text-green-400" />
                <p className="text-white font-semibold">문의가 접수되었습니다.</p>
                <p className="text-sm text-muted">빠른 시일 내에 연락드리겠습니다.</p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-6 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">이름</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="w-full px-3.5 py-2.5 bg-bg-hover border border-border rounded-xl text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">연락처</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="w-full px-3.5 py-2.5 bg-bg-hover border border-border rounded-xl text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">내용</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="문의 내용을 입력해주세요."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-bg-hover border border-border rounded-xl text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "전송 중..." : "문의 전송"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
