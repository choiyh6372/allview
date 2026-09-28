import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, List } from "lucide-react";
import { getPublishedPost, postThumbnail, formatPostDate } from "@/lib/blogStore";
import { sanitizeDescriptionHtml, extractHeadings } from "@/lib/sanitizeDescriptionHtml";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export const revalidate = 600;

type Props = { params: { slug: string } };

function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost(decodeSlug(params.slug));
  if (!post) return {};
  const thumb = postThumbnail(post);
  const path = `/blog/${encodeURIComponent(post.slug)}`;
  return {
    title: `${post.title} | AllView360(올뷰360)`,
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      ...(thumb && { images: [{ url: thumb }] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPost(decodeSlug(params.slug));
  if (!post) notFound();

  const { html, toc: headings } = extractHeadings(sanitizeDescriptionHtml(post.content));
  // 블로그 목차는 h2만 (h3는 FAQ 질문 등 세부 항목이라 제외)
  const toc = headings.filter((item) => item.level === 2);
  const thumb = postThumbnail(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    ...(thumb && { image: [thumb] }),
    author: { "@type": "Organization", name: "AllView360" },
    publisher: { "@type": "Organization", name: "AllView360" },
    mainEntityOfPage: `https://www.allview.kr/blog/${encodeURIComponent(post.slug)}`,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft size={14} /> 블로그 목록
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{post.title}</h1>
        <p className="mt-3 text-xs text-muted">
          <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
          {post.updatedAt.slice(0, 10) !== post.createdAt.slice(0, 10) && (
            <> · 수정 <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time></>
          )}
        </p>
      </header>

      {toc.length > 1 && (
        <nav aria-label="목차" className="mb-10 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-accent mb-2">
            <List size={15} /> 목차
          </p>
          <ol className="divide-y divide-accent/10">
            {toc.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-center gap-3 py-2 text-[13px] text-gray-600 hover:text-accent transition-colors"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-bold flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                    {i + 1}
                  </span>
                  <span className="line-clamp-1">{item.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="complex-description" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="mt-12 pt-6 border-t border-border">
        <Link href="/blog" className="text-sm font-semibold text-accent hover:underline">
          ← 다른 글 보기
        </Link>
      </div>
      <ScrollToTopButton />
    </article>
  );
}
