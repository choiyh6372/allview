import Link from "next/link";
import { PenLine, ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/blogStore";
import { BlogCardGrid } from "@/components/blog/BlogCard";

// 홈 화면 최신 블로그 글. 공개된 글이 없으면 섹션을 숨긴다.
export default async function BlogSection() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-bg-card text-accent">
              <PenLine size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">부동산 블로그</h2>
              <p className="text-xs text-muted mt-0.5">부동산 정보와 강서구 이야기</p>
            </div>
          </div>
          <Link href="/blog" className="flex items-center gap-1 text-sm text-accent hover:underline font-semibold">
            전체보기 <ArrowRight size={14} />
          </Link>
        </div>

        <BlogCardGrid posts={posts} />
      </div>
    </section>
  );
}
