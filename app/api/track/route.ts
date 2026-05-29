import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { recordVisit } from "@/lib/visitStore";

export async function POST(req: NextRequest) {
  // 관리자 로그인 상태면 카운트 제외
  if (req.cookies.get("admin_auth")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const hash = createHash("sha256")
    .update(ip + (process.env.ADMIN_PASSWORD ?? "salt"))
    .digest("hex")
    .slice(0, 16);

  await recordVisit(hash);
  return NextResponse.json({ ok: true });
}
