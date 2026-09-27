"use client";

import { useState, useEffect, useRef } from "react";
import { sanitizeDescriptionHtml } from "@/lib/sanitizeDescriptionHtml";
import { slugify, formatPostDate, type BlogPost } from "@/lib/blogUtils";
import { Loader2, Save, Check, Image as ImageIcon, Eye, Code, Plus, Trash2, ExternalLink } from "lucide-react";

type Draft = Omit<BlogPost, "createdAt" | "updatedAt">;

const EMPTY: Draft = { slug: "", title: "", description: "", content: "", thumbnail: "", published: false };

export default function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  // 편집 중인 글의 원래 슬러그 (새 글이면 null)
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  function openPost(post: BlogPost | null) {
    setOriginalSlug(post?.slug ?? null);
    setDraft(post ? { ...post, thumbnail: post.thumbnail ?? "" } : EMPTY);
    setSlugTouched(Boolean(post));
    setError(null);
    setMode("write");
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: draft, originalSlug: originalSlug ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장 실패");
      const savedPost = data as BlogPost;
      setPosts((prev) => {
        const rest = prev.filter((p) => p.slug !== (originalSlug ?? savedPost.slug));
        return [savedPost, ...rest].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      setOriginalSlug(savedPost.slug);
      setDraft({ ...savedPost, thumbnail: savedPost.thumbnail ?? "" });
      setSlugTouched(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!originalSlug || !confirm("이 글을 삭제하시겠습니까?")) return;
    const res = await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: originalSlug }),
    });
    if (!res.ok) {
      setError("삭제 실패");
      return;
    }
    setPosts((prev) => prev.filter((p) => p.slug !== originalSlug));
    openPost(null);
  }

  async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    form.append("complexId", "posts");
    const res = await fetch("/api/admin/complex-description-images", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "업로드 실패");
    return data.url as string;
  }

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current;
    const current = draft.content;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    update("content", current.slice(0, start) + snippet + current.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleContentImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      insertAtCursor(`\n<img src="${url}" alt="" />\n`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      update("thumbnail", await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
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

  const inputClass =
    "w-full px-3.5 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-gray-900 placeholder:text-muted focus:outline-none focus:border-accent/50";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 글 목록 */}
      <div className="lg:w-64 shrink-0">
        <button
          onClick={() => openPost(null)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 mb-3 bg-accent hover:bg-accent/80 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> 새 글 쓰기
        </button>
        <div className="space-y-1 max-h-[36rem] overflow-y-auto pr-1">
          {posts.length === 0 && <p className="text-xs text-muted px-1">아직 작성한 글이 없습니다.</p>}
          {posts.map((p) => (
            <button
              key={p.slug}
              onClick={() => openPost(p)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                originalSlug === p.slug ? "bg-accent text-white" : "hover:bg-bg-hover text-gray-700"
              }`}
            >
              <span className="block text-sm truncate">{p.title}</span>
              <span className={`block text-[11px] ${originalSlug === p.slug ? "text-white/80" : "text-muted"}`}>
                {formatPostDate(p.createdAt)} · {p.published ? "공개" : "비공개"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 편집 영역 */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-gray-900">{originalSlug ? "글 수정" : "새 글"}</p>
          <div className="flex items-center gap-2">
            {originalSlug && draft.published && (
              <a
                href={`/blog/${encodeURIComponent(originalSlug)}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-2 text-xs text-muted hover:text-accent"
              >
                <ExternalLink size={13} /> 글 보기
              </a>
            )}
            {originalSlug && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 border border-border rounded-xl text-xs text-red-400 hover:border-red-400/50"
              >
                <Trash2 size={13} /> 삭제
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? "저장됨" : "저장"}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">제목</span>
            <input value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="예: 명지국제신도시 초등학교 배정 총정리" className={inputClass} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">주소 (allview.kr/blog/…)</span>
            <input
              value={draft.slug}
              onChange={(e) => { setSlugTouched(true); update("slug", e.target.value); }}
              placeholder="제목에서 자동 생성"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">대표 이미지 (비우면 본문 첫 이미지)</span>
            <div className="flex gap-2">
              <input value={draft.thumbnail ?? ""} onChange={(e) => update("thumbnail", e.target.value)} placeholder="이미지 URL" className={inputClass} />
              <input ref={thumbInputRef} type="file" accept="image/*" hidden onChange={handleThumbnail} />
              <button
                onClick={() => thumbInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0 px-3 border border-border rounded-xl text-xs text-gray-700 hover:border-accent/40 disabled:opacity-50"
              >
                업로드
              </button>
            </div>
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">
              요약 (검색 결과·목록에 표시, {draft.description.length}/160자)
            </span>
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="글 내용을 1~2문장으로 요약하세요."
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-900 font-medium">
            <input type="checkbox" checked={draft.published} onChange={(e) => update("published", e.target.checked)} className="accent-accent" />
            공개 (체크해야 사이트에 보입니다)
          </label>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleContentImage} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-gray-700 hover:border-accent/40 rounded-lg text-xs font-medium disabled:opacity-50"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
              본문 이미지
            </button>
            <div className="flex gap-1 p-0.5 bg-bg-card border border-border rounded-lg">
              <button
                onClick={() => setMode("write")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${mode === "write" ? "bg-accent text-white" : "text-muted"}`}
              >
                <Code size={12} /> 편집
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${mode === "preview" ? "bg-accent text-white" : "text-muted"}`}
              >
                <Eye size={12} /> 미리보기
              </button>
            </div>
          </div>
        </div>

        {mode === "write" ? (
          <textarea
            ref={textareaRef}
            value={draft.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder={`본문을 HTML로 작성하세요.\n<h2>소제목</h2> <p>문단</p> <strong>강조</strong> <a href="...">링크</a> <ul><li>목록</li></ul>\n소제목(h2)은 자동으로 목차가 됩니다.`}
            className="w-full h-[28rem] bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-gray-900 leading-relaxed focus:outline-none focus:border-accent resize-y font-mono"
          />
        ) : (
          <div className="w-full min-h-[28rem] bg-bg-card border border-border rounded-xl px-4 py-3">
            <h1 className="text-2xl font-black text-gray-900 mb-4">{draft.title || "(제목 없음)"}</h1>
            {draft.content ? (
              <div className="complex-description" dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(draft.content) }} />
            ) : (
              <p className="text-sm text-muted">내용이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
