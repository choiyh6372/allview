import { NextRequest, NextResponse } from "next/server";
import { getAllInquiries, saveAllInquiries, purgeExpiredInquiries } from "@/lib/inquiryStore";

export async function GET() {
  const { inquiries } = await purgeExpiredInquiries();
  return NextResponse.json(inquiries);
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const inquiries = await getAllInquiries();
    await saveAllInquiries(inquiries.filter((i) => i.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
