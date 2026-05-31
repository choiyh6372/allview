import { NextRequest, NextResponse } from "next/server";
import { getJeongbiOverrides, saveJeongbiOverrides } from "@/lib/jeongbiOverridesStore";

export async function GET() {
  const overrides = await getJeongbiOverrides();
  return NextResponse.json(overrides);
}

export async function PUT(req: NextRequest) {
  try {
    const { id, address } = await req.json() as { id: string; address: string };
    if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });

    const overrides = await getJeongbiOverrides();
    overrides[id] = address;
    await saveJeongbiOverrides(overrides);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
