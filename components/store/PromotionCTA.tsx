"use client";

import { useState } from "react";
import { CheckCircle, Store } from "lucide-react";

export default function PromotionCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", category: "", region: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="mt-20 rounded-2xl bg-gradient-to-br from-accent/10 to-bg-card border border-accent/20 p-8 sm:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
          <Store size={28} className="text-accent" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
          내 가게를 AllView에 홍보하세요
        </h2>
        <p className="text-gray-400 mb-8">
          입주 예정 주민 수천 명에게 가게를 알릴 수 있습니다.<br />
          등록 신청 후 24시간 내 담당자가 연락드립니다.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle size={48} className="text-green-400" />
            <p className="text-lg font-bold text-white">신청이 접수되었습니다!</p>
            <p className="text-sm text-gray-400">24시간 내 담당자가 연락드리겠습니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">가게명 *</label>
              <input
                required
                type="text"
                placeholder="가게 이름"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">연락처 *</label>
              <input
                required
                type="tel"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">업종</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
              >
                <option value="">업종 선택</option>
                {["카페", "음식점", "마트", "헬스", "약국", "미용", "키즈", "베이커리", "병원", "학원", "기타"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">지역</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
              >
                <option value="">지역 선택</option>
                {["오션시티", "국제신도시", "에코델타"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-sm transition-colors"
              >
                홍보 신청하기
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
