import { getComplexDescriptions, saveComplexDescriptions } from "@/lib/complexDescriptionStore";
import { sanitizeDescriptionHtml } from "@/lib/sanitizeDescriptionHtml";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
