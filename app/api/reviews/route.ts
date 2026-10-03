import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createReview, deleteReviewWithPassword, hashIp, listReviews } from "@/lib/reviewStore";
import { isReviewEnabled, validateReviewInput, type ReviewAuthorType } from "@/lib/reviewUtils";
import { complexData } from "@/lib/vrData";

// 같은 사람(IP)의 연속 작성 제한
const MIN_INTERVAL_MS = 60 * 1000;
const MAX_PER_DAY = 5;

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

function complexPath(complexId: string): string | null {
  const c = complexData.find((x) => x.id === complexId);
  return c ? `/vr-tour/${c.regionId}/${c.slug}` : null;
}

// 후기 작성 (관리자 승인 후 공개)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // 스팸봇용 숨김 입력칸: 값이 있으면 조용히 성공 처리
    if (body.website) return NextResponse.json({ ok: true, pending: true });

    const complexId = String(body.complexId ?? "");
    if (!isReviewEnabled(complexId)) {
      return NextResponse.json({ error: "후기를 쓸 수 없는 단지입니다." }, { status: 400 });
    }
    const error = validateReviewInput(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const ipHash = hashIp(clientIp(req));
    const mine = (await listReviews(complexId)).filter((r) => r.ipHash === ipHash);
    const now = Date.now();
    if (mine.some((r) => now - Date.parse(r.createdAt) < MIN_INTERVAL_MS)) {
      return NextResponse.json({ error: "잠시 후 다시 작성해주세요." }, { status: 429 });
    }
    if (mine.filter((r) => now - Date.parse(r.createdAt) < 24 * 60 * 60 * 1000).length >= MAX_PER_DAY) {
      return NextResponse.json({ error: "하루에 작성할 수 있는 후기 수를 넘었습니다." }, { status: 429 });
    }

    await createReview({
      complexId,
      nickname: body.nickname,
      authorType: body.authorType as ReviewAuthorType,
      content: body.content,
      password: body.password,
      ipHash,
    });
    return NextResponse.json({ ok: true, pending: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}

// 작성자 본인 삭제 (비밀번호 확인)
export async function DELETE(req: NextRequest) {
  try {
    const { complexId, id, password } = await req.json();
    if (!complexId || !id || !password) {
      return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
    }
    const ok = await deleteReviewWithPassword(String(complexId), String(id), String(password));
    if (!ok) return NextResponse.json({ error: "비밀번호가 맞지 않습니다." }, { status: 403 });
    const path = complexPath(String(complexId));
    if (path) revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
