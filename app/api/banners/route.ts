import { NextRequest, NextResponse } from "next/server";
import { getAllStores } from "@/lib/promotionStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position") as "real-estate" | "map" | null;

  const stores = await getAllStores();
  const now = new Date();

  const banners = stores
    .filter((s) => !s.promotionEndDate || new Date(s.promotionEndDate) >= now)
    .flatMap((s) =>
      (s.bannerSlots ?? [])
        .filter((b) => b.active && b.imageUrl && (!position || b.position === position))
        .map((b) => ({
          storeId: s.id,
          position: b.position,
          slot: b.slot,
          imageUrl: b.imageUrl,
        }))
    );

  return NextResponse.json(banners);
}
