import { getVRCounts } from "@/lib/vrCountStore";
import { NextResponse } from "next/server";

export async function GET() {
  const counts = await getVRCounts();
  return NextResponse.json(counts);
}
