import { NextResponse } from "next/server";

const R2_URL =
  "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/%EA%B0%95%EC%84%9C%EA%B5%AC%EC%B4%88%EB%93%B1%ED%95%99%EA%B5%90%ED%86%B5%ED%95%99%EA%B5%AC%EC%97%AD.json";

export async function GET() {
  const res = await fetch(R2_URL, { next: { revalidate: 86400 } });
  if (!res.ok) return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  const data = await res.json();
  return NextResponse.json(data);
}
