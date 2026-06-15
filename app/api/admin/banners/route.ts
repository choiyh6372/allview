import { NextRequest, NextResponse } from "next/server";
import { getAllBanners, saveAllBanners, type AdBannerItem } from "@/lib/bannerStore";
import { randomUUID } from "crypto";

export async function GET() {
  const banners = await getAllBanners();
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as Partial<AdBannerItem>;
    const banners = await getAllBanners();
    const now = new Date().toISOString();
    const banner: AdBannerItem = {
      id: data.id ?? randomUUID(),
      position: data.position ?? "real-estate",
      slot: data.slot ?? 1,
      imageUrl: data.imageUrl ?? "",
      phone: data.phone ?? "",
      active: data.active ?? true,
      createdAt: now,
      updatedAt: now,
    };
    banners.push(banner);
    await saveAllBanners(banners);
    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "등록 실패" }, { status: 500 });
  }
}
