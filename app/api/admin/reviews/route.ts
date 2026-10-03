import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteReview, listReviews, setReviewStatus } from "@/lib/reviewStore";
import type { ReviewStatus } from "@/lib/reviewUtils";
import { complexData } from "@/lib/vrData";

function revalidateComplex(complexId: string) {
  const c = complexData.find((x) => x.id === complexId);
  if (c) revalidatePath(`/vr-tour/${c.regionId}/${c.slug}`);
}

// 전체 후기 (대기 포함). 비밀번호·IP 해시는 내려주지 않음
export async function GET() {
  const reviews = await listReviews();
  return NextResponse.json(
    reviews.map(({ passwordHash: _p, ipHash: _i, ...rest }) => rest)
  );
}

// 승인 / 숨김
export async function PATCH(req: NextRequest) {
  try {
    const { complexId, id, status } = (await req.json()) as { complexId: string; id: string; status: ReviewStatus };
    if (!["pending", "approved", "hidden"].includes(status)) {
      return NextResponse.json({ error: "잘못된 상태" }, { status: 400 });
    }
    const updated = await setReviewStatus(complexId, id, status);
    if (!updated) return NextResponse.json({ error: "후기를 찾을 수 없습니다" }, { status: 404 });
    revalidateComplex(complexId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "변경 실패" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { complexId, id } = await req.json();
    await deleteReview(String(complexId), String(id));
    revalidateComplex(String(complexId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
