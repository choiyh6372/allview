import { NextRequest, NextResponse } from "next/server";
import { getAllStores, saveAllStores, type PromotionStore } from "@/lib/promotionStore";
import { deleteKey, urlToKey } from "@/lib/r2Client";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const data = (await req.json()) as PromotionStore;
    const stores = await getAllStores();
    const idx = stores.findIndex((s) => s.id === params.id);
    if (idx === -1)
      return NextResponse.json({ error: "가게를 찾을 수 없습니다" }, { status: 404 });
    stores[idx] = { ...data, id: params.id, updatedAt: new Date().toISOString() };
    await saveAllStores(stores);
    return NextResponse.json(stores[idx]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const stores = await getAllStores();
    const store = stores.find((s) => s.id === params.id);
    if (!store)
      return NextResponse.json({ error: "가게를 찾을 수 없습니다" }, { status: 404 });

    await Promise.all(store.photos.map((url) => deleteKey(urlToKey(url))));

    await saveAllStores(stores.filter((s) => s.id !== params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
