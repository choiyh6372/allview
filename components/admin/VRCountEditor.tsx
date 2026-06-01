"use client";

import { useState, useEffect } from "react";
import { complexData } from "@/lib/vrData";
import { Loader2, Save, Check } from "lucide-react";

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

export default function VRCountEditor() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/vr-counts")
      .then((r) => r.json())
      .then((data) => { setCounts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/vr-counts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(counts),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">단지별 실제 VR 파일 있는 평형수를 입력하세요</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <Check size={15} />
          ) : (
            <Save size={15} />
          )}
          {saved ? "저장됨" : "저장"}
        </button>
      </div>

      <div className="space-y-6">
        {regions.map((region) => {
          const list = complexData.filter((c) => c.regionName === region);
          return (
            <div key={region}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{region}</h3>
              <div className="grid grid-cols-3 gap-2">
                {list.map((complex) => (
                  <div
                    key={complex.id}
                    className="bg-bg-card border border-border rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-gray-900 truncate">{complex.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={complex.types.length}
                        value={counts[complex.id] ?? complex.types.length}
                        onChange={(e) =>
                          setCounts((prev) => ({ ...prev, [complex.id]: Number(e.target.value) }))
                        }
                        className="w-10 text-center bg-bg border border-border rounded-lg px-1 py-0.5 text-xs text-gray-900 focus:outline-none focus:border-accent"
                      />
                      <span className="text-xs text-muted">/ {complex.types.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
