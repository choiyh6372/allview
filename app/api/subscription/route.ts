import { NextResponse } from "next/server";
import { CACHE_TTL, getSubscriptions } from "@/lib/subscription";

export type { SubscriptionItem } from "@/lib/subscription";

export const revalidate = 86400; // 라우트 응답 자체를 24시간 캐시

export async function GET() {
  const { items, error } = await getSubscriptions();
  if (error) return NextResponse.json({ error, items: [] }, { status: 500 });
  return NextResponse.json(
    { items, total: items.length },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
