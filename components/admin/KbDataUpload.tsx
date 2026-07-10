"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";

interface UploadResult {
  ok?: boolean;
  error?: string;
  updatedAt?: string;
  saleMatched?: number;
  jeonseMatched?: number;
  ratioMatched?: number;
}

function UploadCard({ type, title, hint }: { type: "weekly" | "monthly"; title: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      const res = await fetch("/api/admin/kb-upload", { method: "POST", body: form });
      const data = await res.json();
      setResult(res.ok ? { ok: true, ...data } : { ok: false, error: data.error ?? "업로드 실패" });
    } catch {
      setResult({ ok: false, error: "업로드 중 오류가 발생했습니다" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-muted mb-4">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? "업로드 중..." : "엑셀 파일 선택"}
      </button>

      {fileName && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted">
          <FileSpreadsheet size={13} />
          {fileName}
        </div>
      )}

      {result && (
        <div className={`flex items-start gap-2 mt-3 p-3 rounded-lg text-xs ${result.ok ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
          {result.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <XCircle size={14} className="shrink-0 mt-0.5" />}
          {result.ok ? (
            <div>
              <p className="font-semibold">저장 완료 · 기준일 {result.updatedAt}</p>
              {result.saleMatched !== undefined && (
                <p className="mt-0.5 text-muted">매매 {result.saleMatched}개 · 전세 {result.jeonseMatched}개 시/군/구 매칭</p>
              )}
              {result.ratioMatched !== undefined && (
                <p className="mt-0.5 text-muted">매매전세비 {result.ratioMatched}개 시/군/구 매칭</p>
              )}
            </div>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function KbDataUpload() {
  return (
    <div>
      <p className="text-sm text-muted mb-6">
        KB부동산 데이터허브에서 받은 엑셀 파일을 업로드하면 바로 파싱되어 전국 시장동향 페이지에 반영됩니다. (커밋/배포 불필요)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadCard
          type="weekly"
          title="주간시계열"
          hint="매매·전세 증감률, 매매·전세지수 (예: 20260706_주간시계열.xlsx)"
        />
        <UploadCard
          type="monthly"
          title="월간 주택 시계열"
          hint="아파트 매매전세비 (예: 202606_월간 주택 시계열.xlsx)"
        />
      </div>
    </div>
  );
}
