"use client";

import { useState, useEffect, useRef } from "react";
import { complexData } from "@/lib/vrData";
import { sanitizeDescriptionHtml } from "@/lib/sanitizeDescriptionHtml";
import { Loader2, Save, Check, Image as ImageIcon, Eye, Code } from "lucide-react";

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

export default function ComplexDescriptionEditor() {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState(complexData[0]?.id ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/complex-descriptions")
      .then((r) => r.json())
      .then((data) => { setDescriptions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/complex-descriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(descriptions),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current;
    const current = descriptions[selectedId] ?? "";
    if (!el) {
      setDescriptions((prev) => ({ ...prev, [selectedId]: current + snippet }));
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + snippet + current.slice(end);
    setDescriptions((prev) => ({ ...prev, [selectedId]: next }));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("complexId", selectedId);
      const res = await fetch("/api/admin/complex-description-images", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "업로드 실패");
      insertAtCursor(`\n<img src="${data.url}" alt="" />\n`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  const selected = complexData.find((c) => c.id === selectedId);
  const text = descriptions[selectedId] ?? "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">단지를 선택해 소개글을 작성하세요. HTML 태그를 그대로 쓸 수 있습니다 (h2, p, strong, a, img, ul/li 등). 단지 상세페이지에 그대로 노출됩니다.</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shrink-0 ml-4"
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

      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-4 max-h-[32rem] overflow-y-auto pr-1">
          {regions.map((region) => {
            const list = complexData.filter((c) => c.regionName === region);
            return (
              <div key={region}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{region}</h3>
                <div className="space-y-1">
                  {list.map((complex) => (
                    <button
                      key={complex.id}
                      onClick={() => setSelectedId(complex.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs truncate transition-colors ${
                        selectedId === complex.id
                          ? "bg-accent text-white"
                          : "text-gray-700 hover:bg-bg-hover"
                      }`}
                    >
                      {complex.name}
                      {descriptions[complex.id] && <span className="ml-1 opacity-60">●</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          {selected && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-900">{selected.name}</p>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                    이미지 업로드
                  </button>
                  <div className="flex gap-1 p-0.5 bg-bg-card border border-border rounded-lg">
                    <button
                      onClick={() => setMode("write")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        mode === "write" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
                      }`}
                    >
                      <Code size={12} /> 편집
                    </button>
                    <button
                      onClick={() => setMode("preview")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        mode === "preview" ? "bg-accent text-white" : "text-muted hover:text-gray-900"
                      }`}
                    >
                      <Eye size={12} /> 미리보기
                    </button>
                  </div>
                </div>
              </div>
              {uploadError && <p className="text-xs text-red-400 mb-2">{uploadError}</p>}
              {/<!DOCTYPE|<html[\s>]|<head[\s>]|<style[\s>]/i.test(text) && (
                <p className="text-xs text-amber-500 mb-2">
                  ⚠ 전체 HTML 문서(&lt;html&gt;, &lt;style&gt; 등)가 감지되었습니다. 저장 시 본문만 자동으로 추려내고 나머지는 제거됩니다. 미리보기에서 결과를 확인하세요.
                </p>
              )}
              {mode === "write" ? (
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setDescriptions((prev) => ({ ...prev, [selectedId]: e.target.value }))}
                  placeholder={`블로그 글처럼 단지 소개, 입지, 생활환경 등을 자유롭게 작성하세요.\n\nHTML 태그 사용 가능: <h2>소제목</h2> <p>문단</p> <strong>강조</strong> <a href="...">링크</a>\n이미지는 위 "이미지 업로드" 버튼으로 커서 위치에 삽입됩니다.\n\n※ <!DOCTYPE html>로 시작하는 전체 문서를 붙여넣지 마세요 - 본문(HTML 조각)만 넣어야 합니다.`}
                  className="w-full h-96 bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-gray-900 leading-relaxed focus:outline-none focus:border-accent resize-y font-mono"
                />
              ) : (
                <div className="w-full min-h-96 bg-bg-card border border-border rounded-xl px-4 py-3">
                  {text ? (
                    <div className="complex-description" dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(text) }} />
                  ) : (
                    <p className="text-sm text-muted">내용이 없습니다.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
