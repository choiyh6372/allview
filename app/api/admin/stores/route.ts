import { NextRequest, NextResponse } from "next/server";
import { getAllStores, saveAllStores, type PromotionStore } from "@/lib/promotionStore";

export async function GET() {
  const stores = await getAllStores();
  return NextResponse.json(stores);
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as PromotionStore;
    const stores = await getAllStores();
    const now = new Date().toISOString();
    const store: PromotionStore = { ...data, createdAt: now, updatedAt: now };
    stores.push(store);
    await saveAllStores(stores);
    return NextResponse.json(store, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "등록 실패" }, { status: 500 });
  }
}
