"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { JeongbiProject } from "@/lib/jeongbiData";
import { Pencil, Check, X, Loader2 } from "lucide-react";

export default function JeongbiAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<JeongbiProject[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [editingGuId, setEditingGuId] = useState<string | null>(null);
  const [editGuValue, setEditGuValue] = useState("");
  const [savingGuId, setSavingGuId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jeongbi")
      .then((r) => r.json())
      .then((d) => { setItems(d.items ?? []); setSource(d.source ?? ""); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = (filter
    ? items.filter((it) =>
        it.name.includes(filter) ||
        it.gu.includes(filter) ||
        it.address.includes(filter) ||
        it.status.includes(filter) ||
        it.type.includes(filter)
      )
    : [...items]
  ).sort((a, b) => sortAsc ? a.name.localeCompare(b.name, "ko") : b.name.localeCompare(a.name, "ko"));

  function startEdit(item: JeongbiProject) {
    setEditingGuId(null);
    setEditingId(item.id);
    setEditValue(item.address);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveEdit(item: JeongbiProject) {
    setSavingId(item.id);
    try {
      const res = await fetch("/api/admin/jeongbi-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, address: editValue }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((it) => it.id === item.id ? { ...it, address: editValue } : it)
      );
      setEditingId(null);
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  }

  function startEditGu(item: JeongbiProject) {
    setEditingId(null);
    setEditingGuId(item.id);
    setEditGuValue(item.gu);
  }

  function cancelEditGu() {
    setEditingGuId(null);
    setEditGuValue("");
  }

  async function saveEditGu(item: JeongbiProject) {
    setSavingGuId(item.id);
    try {
      const res = await fetch("/api/admin/jeongbi-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, gu: editGuValue }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((it) => it.id === item.id ? { ...it, gu: editGuValue } : it)
      );
      setEditingGuId(null);
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSavingGuId(null);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-muted">
      <Loader2 size={24} className="animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">정비사업 전체 데이터</h1>
          <p className="text-xs text-muted mt-0.5">
            소스: <span className="font-semibold text-gray-300">{source === "api" ? "공공 API" : "정적 데이터"}</span>
            &nbsp;·&nbsp;총 <span className="font-semibold text-gray-300">{items.length}건</span>
            {filter && <>&nbsp;·&nbsp;검색 결과 <span className="font-semibold text-gray-300">{filtered.length}건</span></>}
          </p>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="text-xs text-muted hover:text-gray-900 transition-colors underline"
        >
          ← 관리자 홈
        </button>
      </div>

      <input
        type="text"
        placeholder="이름·구·주소·현황·유형으로 검색..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full mb-4 px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-gray-900 placeholder-muted focus:outline-none focus:ring-2 focus:ring-rose-500/50"
      />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-card text-muted text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-8">#</th>
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">
                <button
                  onClick={() => setSortAsc((v) => !v)}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  구역명 <span>{sortAsc ? "↑" : "↓"}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold">유형</th>
              <th className="px-4 py-3 text-left font-semibold">추진현황</th>
              <th className="px-4 py-3 text-left font-semibold min-w-[130px]">구</th>
              <th className="px-4 py-3 text-left font-semibold min-w-[300px]">주소</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item, i) => (
              <tr key={item.id} className="hover:bg-bg-card/50 transition-colors">
                <td className="px-4 py-2.5 text-muted text-xs">{i + 1}</td>
                <td className="px-4 py-2.5 text-muted font-mono text-xs">{item.id}</td>
                <td className="px-4 py-2.5 font-semibold text-gray-900">{item.name}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-bg-card border border-border text-muted">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={item.status} />
                </td>

                {/* 구 셀 */}
                <td className="px-4 py-2.5">
                  {editingGuId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editGuValue}
                        onChange={(e) => setEditGuValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditGu(item);
                          if (e.key === "Escape") cancelEditGu();
                        }}
                        autoFocus
                        placeholder="예: 금정구"
                        className="w-24 px-2 py-1 bg-bg border border-accent/50 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      />
                      <button
                        onClick={() => saveEditGu(item)}
                        disabled={savingGuId === item.id}
                        className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                      >
                        {savingGuId === item.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Check size={14} />}
                      </button>
                      <button onClick={cancelEditGu} className="p-1 text-muted hover:text-gray-900">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className={item.gu ? "text-gray-300" : "text-red-400 font-semibold"}>
                        {item.gu || "구 없음"}
                      </span>
                      <button
                        onClick={() => startEditGu(item)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-gray-900 transition-opacity"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                </td>

                {/* 주소 셀 */}
                <td className="px-4 py-2.5">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(item);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-bg border border-accent/50 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-accent/50 min-w-[200px]"
                      />
                      <button
                        onClick={() => saveEdit(item)}
                        disabled={savingId === item.id}
                        className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                      >
                        {savingId === item.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Check size={14} />}
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-muted hover:text-gray-900">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className={item.address ? "text-gray-300" : "text-red-400 font-semibold"}>
                        {item.address || "주소 없음"}
                      </span>
                      <button
                        onClick={() => startEdit(item)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-gray-900 transition-opacity"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  검색 결과가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: JeongbiProject["status"] }) {
  const styles: Record<string, string> = {
    "추진위":   "bg-yellow-500/10 text-yellow-400",
    "조합설립": "bg-yellow-500/10 text-yellow-400",
    "사업시행": "bg-orange-500/10 text-orange-400",
    "관리처분": "bg-orange-500/10 text-orange-400",
    "착공":     "bg-blue-500/10 text-blue-400",
    "준공":     "bg-emerald-500/10 text-emerald-400",
    "해제":     "bg-gray-500/10 text-gray-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-500/10 text-gray-600"}`}>
      {status}
    </span>
  );
}
