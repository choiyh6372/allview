import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPosts, saveAllPosts, isValidSlug, type BlogPost } from "@/lib/blogStore";
import { sanitizeDescriptionHtml } from "@/lib/sanitizeDescriptionHtml";

function revalidateBlog(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  for (const s of slugs) revalidatePath(`/blog/${s}`);
}

export async function GET() {
  const posts = await getAllPosts();
  posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(posts);
}

// 글 생성·수정. originalSlug가 있으면 해당 글을 수정(슬러그 변경 포함)
export async function PUT(req: NextRequest) {
  try {
    const { post, originalSlug } = (await req.json()) as {
      post: Omit<BlogPost, "createdAt" | "updatedAt">;
      originalSlug?: string;
    };

    const slug = post.slug?.trim();
    const title = post.title?.trim();
    if (!title) return NextResponse.json({ error: "제목을 입력해주세요" }, { status: 400 });
    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ error: "주소(슬러그)는 한글·영문·숫자·하이픈만 쓸 수 있습니다" }, { status: 400 });
    }

    const posts = await getAllPosts();
    if (slug !== originalSlug && posts.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "같은 주소의 글이 이미 있습니다" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const existing = originalSlug ? posts.find((p) => p.slug === originalSlug) : undefined;
    const saved: BlogPost = {
      slug,
      title,
      description: post.description?.trim() ?? "",
      content: sanitizeDescriptionHtml(post.content ?? ""),
      thumbnail: post.thumbnail?.trim() || undefined,
      published: Boolean(post.published),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const next = existing
      ? posts.map((p) => (p.slug === originalSlug ? saved : p))
      : [saved, ...posts];
    await saveAllPosts(next);
    revalidateBlog(slug, ...(originalSlug && originalSlug !== slug ? [originalSlug] : []));
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { slug } = (await req.json()) as { slug: string };
    const posts = await getAllPosts();
    await saveAllPosts(posts.filter((p) => p.slug !== slug));
    revalidateBlog(slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
