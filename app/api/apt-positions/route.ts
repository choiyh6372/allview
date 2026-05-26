import { NextResponse } from "next/server";
import { getAptPositions } from "@/lib/aptPositionStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAptPositions();
  return NextResponse.json(data);
}
