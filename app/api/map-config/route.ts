import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ kakaoKey: process.env.KAKAO_MAP_KEY ?? "" });
}
