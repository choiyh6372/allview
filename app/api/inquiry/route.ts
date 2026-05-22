import { NextRequest, NextResponse } from "next/server";
import { getAllInquiries, saveAllInquiries, type Inquiry } from "@/lib/inquiryStore";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, content } = await req.json();
    if (!name?.trim() || !phone?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "모든 항목을 입력해주세요" }, { status: 400 });
    }
    const inquiries = await getAllInquiries();
    const inquiry: Inquiry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      phone: phone.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    inquiries.unshift(inquiry);
    await saveAllInquiries(inquiries);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
