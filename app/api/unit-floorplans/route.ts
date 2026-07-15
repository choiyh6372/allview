import { getUnitFloorPlans } from "@/lib/unitFloorPlanStore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const map = await getUnitFloorPlans();
  return NextResponse.json(map);
}
