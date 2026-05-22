"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "로그인 실패");
      }
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <Lock size={22} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-white">관리자 로그인</h1>
          <p className="text-sm text-muted mt-1">AllView 가게홍보 관리</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
