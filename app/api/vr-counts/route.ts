import { getVRCounts } from "@/lib/vrCountStore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const counts = await getVRCounts();
  return NextResponse.json(counts);
}
