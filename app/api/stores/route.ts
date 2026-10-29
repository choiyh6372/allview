import { NextResponse } from "next/server";
import { getActiveStores } from "@/lib/promotionStore";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getActiveStores());
}
