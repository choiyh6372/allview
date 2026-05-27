import Link from "next/link";
import { Newspaper, ExternalLink, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { NaverNewsItem } from "@/app/api/news/route";
import StoreBanner from "@/components/home/StoreBanner";

const PER_PAGE = 10;

const SEARCH_KEYWORDS = ["명지국제신도시", "명지오션시티", "에코델타시티"];

function stripHtml(str: string) {
  return str.replace(/<[^>]*>/g, "");
}

function formatDate(pubDate: string) {
  const d = new Date(pubDate);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getSource(item: NaverNewsItem): string {
  try {
    const url = new URL(item.originallink || item.link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function fetchByQuery(
  keyword: string,
  clientId: string,
  clientSecret: string
): Promise<NaverNewsItem[]> {
  const query = encodeURIComponent(keyword);
  const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=100&sort=date`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items as NaverNewsItem[];
  } catch {
    return [];
  }
}

async function getNews(): Promise<NaverNewsItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const results = await Promise.all(
    SEARCH_KEYWORDS.map((kw) => fetchByQuery(kw, clientId, clientSecret))
  );

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const seen = new Set<string>();
  return results
    .flat()
    .filter((item) => {
      const key = item.originallink || item.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return new Date(item.pubDate).getTime() >= oneWeekAgo;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export const metadata = {
  title: "강서구 부동산 뉴스 | AllView360(올뷰360) - 명지오션시티·에코델타시티",
  description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 관련 최신 부동산 뉴스를 확인하세요.",
  keywords: "부산 강서구 뉴스, 명지오션시티, 명지국제신도시, 에코델타시티, 부동산 뉴스, 강서구 부동산",
  openGraph: {
    title: "강서구 부동산 뉴스 | AllView360(올뷰360) - 명지오션시티·에코델타시티",
    description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 관련 최신 부동산 뉴스를 확인하세요.",
    url: "https://allview.kr/news",
    images: [
      {
        url: "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const allItems = await getNews();
  const totalPages = Math.ceil(allItems.length / PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const items = allItems.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // 페이지 버튼 범위: 현재 페이지 기준 앞뒤 2페이지
  const pageStart = Math.max(1, currentPage - 2);
  const pageEnd = Math.min(totalPages, currentPage + 2);
  const pageNums = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 rounded-xl bg-bg-card text-amber-400">
          <Newspaper size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">부동산 뉴스</h1>
          <p className="text-sm text-muted mt-0.5">
            부산 강서구 최신 부동산 소식
            {allItems.length > 0 && (
              <span className="ml-2">· 총 {allItems.length}건</span>
            )}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 text-muted text-sm">뉴스를 불러올 수 없습니다.</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {items.map((item, i) => (
              <li key={i}>
                <a
                  href={item.originallink || item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full p-4 rounded-xl bg-bg-card border border-border hover:border-accent/40 hover:bg-bg-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug line-clamp-2">
                      {stripHtml(item.title)}
                    </h2>
                    <ExternalLink size={13} className="shrink-0 mt-0.5 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-1">
                      {stripHtml(item.description)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(item.pubDate)}
                    </span>
                    {getSource(item) && (
                      <span className="font-medium truncate">{getSource(item)}</span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <Link
                href={`/news?page=${currentPage - 1}`}
                aria-disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "text-border pointer-events-none"
                    : "text-muted hover:text-white hover:bg-bg-hover"
                }`}
              >
                <ChevronLeft size={18} />
              </Link>

              {pageNums.map((n) => (
                <Link
                  key={n}
                  href={`/news?page=${n}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === currentPage
                      ? "bg-accent text-white"
                      : "text-muted hover:text-white hover:bg-bg-hover"
                  }`}
                >
                  {n}
                </Link>
              ))}

              <Link
                href={`/news?page=${currentPage + 1}`}
                aria-disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "text-border pointer-events-none"
                    : "text-muted hover:text-white hover:bg-bg-hover"
                }`}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>

    <StoreBanner />
    </>
  );
}
