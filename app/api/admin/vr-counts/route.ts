import { saveVRCounts } from "@/lib/vrCountStore";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const counts = await req.json();
    await saveVRCounts(counts);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
