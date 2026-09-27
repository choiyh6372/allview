import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredInquiries, INQUIRY_RETENTION_MONTHS } from "@/lib/inquiryStore";

// 보관 기간이 지난 문의(개인정보)를 매일 자동 파기
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inquiries, removed } = await purgeExpiredInquiries();
  return NextResponse.json({
    ok: true,
    retentionMonths: INQUIRY_RETENTION_MONTHS,
    removed,
    remaining: inquiries.length,
  });
}
