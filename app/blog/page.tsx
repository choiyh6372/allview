import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { getPublishedPosts } from "@/lib/blogStore";
import { BlogCardGrid } from "@/components/blog/BlogCard";

export const revalidate = 600;

const PER_PAGE = 15;

type Props = { searchParams: { page?: string } };

const pageOf = (searchParams: Props["searchParams"]) => Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
const pageHref = (n: number) => (n === 1 ? "/blog" : `/blog?page=${n}`);

export function generateMetadata({ searchParams }: Props): Metadata {
  const page = pageOf(searchParams);
  return {
    title: `부동산 블로그${page > 1 ? ` (${page}페이지)` : ""} | AllView360(올뷰360) - 부동산 정보와 강서구 이야기`,
    description:
      "청약, 전세, 면적·평수 계산 등 알아두면 좋은 부동산 정보와 명지오션시티·명지국제신도시·에코델타시티 등 부산 강서구 이야기를 정리한 AllView360 블로그입니다.",
    alternates: { canonical: pageHref(page) },
  };
}

export default async function BlogListPage({ searchParams }: Props) {
  const posts = await getPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const page = pageOf(searchParams);
  if (page > totalPages) notFound();
  const shown = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 rounded-xl bg-bg-card text-accent">
          <PenLine size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">부동산 블로그</h1>
          <p className="text-sm text-muted mt-0.5">부동산 정보와 강서구 이야기</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted">아직 작성된 글이 없습니다.</p>
      ) : (
        <>
          <BlogCardGrid posts={shown} />

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="블로그 페이지">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} aria-label="이전 페이지" className="p-2 rounded-lg border border-border text-gray-700 hover:border-accent/40">
                  <ChevronLeft size={18} />
                </Link>
              ) : (
                <span className="p-2 rounded-lg border border-border text-gray-300"><ChevronLeft size={18} /></span>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-center text-sm font-semibold ${
                    n === page ? "bg-accent text-white" : "border border-border text-gray-700 hover:border-accent/40"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} aria-label="다음 페이지" className="p-2 rounded-lg border border-border text-gray-700 hover:border-accent/40">
                  <ChevronRight size={18} />
                </Link>
              ) : (
                <span className="p-2 rounded-lg border border-border text-gray-300"><ChevronRight size={18} /></span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
