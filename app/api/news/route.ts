import { NextResponse } from "next/server";

export interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

const SEARCH_KEYWORDS = ["명지국제신도시", "명지오션시티", "에코델타시티"];

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const display = Number(searchParams.get("display") ?? "20");

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const results = await Promise.all(
    SEARCH_KEYWORDS.map((kw) => fetchByQuery(kw, clientId, clientSecret))
  );

  const seen = new Set<string>();
  const merged = results
    .flat()
    .filter((item) => {
      const key = item.originallink || item.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, display);

  return NextResponse.json({ items: merged });
}
