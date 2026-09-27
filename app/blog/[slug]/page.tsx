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

  const { html, toc } = extractHeadings(sanitizeDescriptionHtml(post.content));
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
        <nav className="mb-8 p-5 rounded-2xl border border-border bg-bg-card">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            <List size={13} /> 목차
          </p>
          <ol className="space-y-1.5">
            {toc.map((item) => (
              <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                <a href={`#${item.id}`} className="text-sm text-gray-700 hover:text-accent transition-colors">
                  {item.text}
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
