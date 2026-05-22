import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_auth";

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function expectedToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "_allview_admin");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufToHex(hash);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인 페이지·로그인 API는 통과
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await expectedToken(process.env.ADMIN_PASSWORD ?? "");

  if (token !== expected) {
    // API 요청이면 401, 페이지 요청이면 로그인으로 리다이렉트
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
