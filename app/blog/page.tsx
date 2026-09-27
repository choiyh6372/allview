import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { getPublishedPosts, postThumbnail, formatPostDate } from "@/lib/blogStore";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "부동산 블로그 | AllView360(올뷰360) - 명지·에코델타시티 부동산 이야기",
  description:
    "명지오션시티, 명지국제신도시, 에코델타시티 아파트와 부산 강서구 부동산 정보를 쉽게 정리한 AllView360 블로그입니다.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 rounded-xl bg-bg-card text-accent">
          <PenLine size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">부동산 블로그</h1>
          <p className="text-sm text-muted mt-0.5">명지·에코델타시티 부동산 이야기를 정리합니다</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted">아직 작성된 글이 없습니다.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => {
            const thumb = postThumbnail(post);
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${encodeURIComponent(post.slug)}`}
                  className="group flex flex-col h-full rounded-2xl border border-border bg-bg-card overflow-hidden hover:border-accent/40 transition-colors"
                >
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" loading="lazy" className="w-full aspect-[16/9] object-cover" />
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.description && (
                      <p className="mt-2 text-sm text-muted line-clamp-3 flex-1">{post.description}</p>
                    )}
                    <time dateTime={post.createdAt} className="mt-4 text-xs text-muted">
                      {formatPostDate(post.createdAt)}
                    </time>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
