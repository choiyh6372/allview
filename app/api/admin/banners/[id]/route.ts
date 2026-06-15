import { NextRequest, NextResponse } from "next/server";
import { getAllBanners, saveAllBanners, type AdBannerItem } from "@/lib/bannerStore";
import { deleteKey, urlToKey } from "@/lib/r2Client";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const data = (await req.json()) as AdBannerItem;
    const banners = await getAllBanners();
    const idx = banners.findIndex((b) => b.id === params.id);
    if (idx === -1)
      return NextResponse.json({ error: "배너를 찾을 수 없습니다" }, { status: 404 });
    banners[idx] = { ...data, id: params.id, updatedAt: new Date().toISOString() };
    await saveAllBanners(banners);
    return NextResponse.json(banners[idx]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const banners = await getAllBanners();
    const banner = banners.find((b) => b.id === params.id);
    if (!banner)
      return NextResponse.json({ error: "배너를 찾을 수 없습니다" }, { status: 404 });
    if (banner.imageUrl) await deleteKey(urlToKey(banner.imageUrl));
    await saveAllBanners(banners.filter((b) => b.id !== params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
