import { NextRequest, NextResponse } from "next/server";
import { getAptPositions, saveAptPositions } from "@/lib/aptPositionStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAptPositions();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const { id, lat, lng } = await req.json();
  if (!id || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const current = await getAptPositions();
  current[id] = { lat, lng };
  await saveAptPositions(current);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const current = await getAptPositions();
  delete current[id];
  await saveAptPositions(current);
  return NextResponse.json({ ok: true });
}
