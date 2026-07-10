import { R2_PUBLIC_URL } from "@/lib/r2Client";
import localWeeklySido from "@/lib/data/kb-weekly-sido.json";
import localWeeklySgg from "@/lib/data/kb-weekly-sigungu.json";
import localIndexSido from "@/lib/data/kb-index-sido.json";
import localIndexSgg from "@/lib/data/kb-index-sigungu.json";
import localRatioSido from "@/lib/data/kb-ratio-sido.json";
import localRatioSgg from "@/lib/data/kb-ratio-sigungu.json";

const LOCAL_FALLBACK: Record<string, unknown> = {
  "kb-weekly-sido.json": localWeeklySido,
  "kb-weekly-sigungu.json": localWeeklySgg,
  "kb-index-sido.json": localIndexSido,
  "kb-index-sigungu.json": localIndexSgg,
  "kb-ratio-sido.json": localRatioSido,
  "kb-ratio-sigungu.json": localRatioSgg,
};

// 관리자 페이지에서 새 엑셀을 업로드하면 R2의 데이터가 최신이 됨.
// 아직 한 번도 업로드되지 않았다면(404) 레포에 커밋된 초기 데이터로 대체.
export async function loadKbData<T>(filename: string): Promise<T> {
  try {
    const res = await fetch(`${R2_PUBLIC_URL}/kb-data/${filename}`, { cache: "no-store" });
    if (res.ok) return (await res.json()) as T;
  } catch {
    // R2 조회 실패 시 로컬 데이터로 대체
  }
  return LOCAL_FALLBACK[filename] as T;
}
