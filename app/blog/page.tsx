import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { getPublishedPosts } from "@/lib/blogStore";
import { BlogCardGrid } from "@/components/blog/BlogCard";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "부동산 블로그 | AllView360(올뷰360) - 부동산 정보와 강서구 이야기",
  description:
    "청약, 전세, 면적·평수 계산 등 알아두면 좋은 부동산 정보와 명지오션시티·명지국제신도시·에코델타시티 등 부산 강서구 이야기를 정리한 AllView360 블로그입니다.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage() {
  const posts = await getPublishedPosts();

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
        <BlogCardGrid posts={posts} />
      )}
    </div>
  );
}
