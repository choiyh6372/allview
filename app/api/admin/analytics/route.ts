import { NextResponse } from "next/server";
import { getVisitStats } from "@/lib/visitStore";

export async function GET() {
  const stats = await getVisitStats();
  return NextResponse.json(stats);
}
