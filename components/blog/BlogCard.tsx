import Link from "next/link";
import { postThumbnail, type BlogPost } from "@/lib/blogUtils";

// 블로그 카드: 16:9 썸네일 + 제목 (블로그 목록·홈 화면 공용)
export default function BlogCard({ post }: { post: BlogPost }) {
  const thumb = postThumbnail(post);
  return (
    <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="group block">
      <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border bg-bg-card">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        )}
      </div>
      <h3 className="mt-3 text-[15px] font-bold leading-snug text-gray-900 group-hover:text-accent transition-colors line-clamp-2">
        {post.title}
      </h3>
    </Link>
  );
}

export function BlogCardGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <BlogCard post={post} />
        </li>
      ))}
    </ul>
  );
}
