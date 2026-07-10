import { NextResponse } from "next/server";
import { loadKbData } from "@/lib/kbData";

export const runtime = "nodejs";

export async function GET() {
  const [sido, sgg] = await Promise.all([
    loadKbData("kb-weekly-sido.json"),
    loadKbData("kb-weekly-sigungu.json"),
  ]);
  return NextResponse.json({ sido, sgg });
}
