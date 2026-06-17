import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json([], {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
