import { getComplexDescriptions, saveComplexDescriptions } from "@/lib/complexDescriptionStore";
import { sanitizeDescriptionHtml } from "@/lib/sanitizeDescriptionHtml";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { complexData } from "@/lib/vrData";
// 관리자 데이터는 매번 새로 읽는다 (정적으로 굳으면 GET이 빌드 시점 데이터가 되고 PUT은 405가 됨)
export const dynamic = "force-dynamic";


export async function GET() {
  const descriptions = await getComplexDescriptions();
  return NextResponse.json(descriptions);
}

export async function PUT(req: NextRequest) {
  try {
    const descriptions = (await req.json()) as Record<string, string>;
    const cleaned = Object.fromEntries(
      Object.entries(descriptions).map(([id, html]) => [id, sanitizeDescriptionHtml(html)])
    );
    await saveComplexDescriptions(cleaned);
    for (const c of complexData) revalidatePath(`/vr-tour/${c.regionId}/${c.slug}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
