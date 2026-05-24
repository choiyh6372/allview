import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24시간

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function makeToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "_allview_admin");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufToHex(hash);
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다" }, { status: 401 });
  }

  const token = await makeToken(adminPassword);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
