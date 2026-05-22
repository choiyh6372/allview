import { NextResponse } from "next/server";
import { getAllStores } from "@/lib/promotionStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const stores = await getAllStores();
  const now = new Date();
  const active = stores.filter(
    (s) => !s.promotionEndDate || new Date(s.promotionEndDate) >= now
  );
  return NextResponse.json(active);
}
