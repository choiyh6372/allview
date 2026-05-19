import { R2_BASE } from "@/lib/vrData";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith(R2_BASE)) {
    return NextResponse.json({ exists: false });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    return NextResponse.json({ exists: res.ok });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
