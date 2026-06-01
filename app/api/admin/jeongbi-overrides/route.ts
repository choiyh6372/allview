import { NextRequest, NextResponse } from "next/server";
import { getJeongbiOverrides, saveJeongbiOverride } from "@/lib/jeongbiOverridesStore";

export async function GET() {
  const overrides = await getJeongbiOverrides();
  return NextResponse.json(overrides);
}

export async function PUT(req: NextRequest) {
  try {
    const { id, address, gu } = await req.json() as { id: string; address?: string; gu?: string };
    if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });

    const patch: { address?: string; gu?: string } = {};
    if (address !== undefined) patch.address = address;
    if (gu !== undefined) patch.gu = gu;

    await saveJeongbiOverride(id, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
