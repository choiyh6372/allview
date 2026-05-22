import { NextResponse } from "next/server";

export interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

const FILTER_KEYWORDS = ["강서구", "명지"];

function isGangseoRelated(item: NaverNewsItem): boolean {
  const text = (item.title + " " + item.description).replace(/<[^>]*>/g, "");
  return FILTER_KEYWORDS.some((kw) => text.includes(kw));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const display = Number(searchParams.get("display") ?? "20");

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // 필터링 후 display 개수 확보를 위해 최대치(100)로 요청
  const fetchCount = Math.min(display * 4, 100);
  const query = encodeURIComponent("부산 강서구 부동산");
  const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=${fetchCount}&sort=date`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Naver API error", status: res.status }, { status: 502 });
  }

  const data = await res.json();
  const filtered = (data.items as NaverNewsItem[]).filter(isGangseoRelated).slice(0, display);
  return NextResponse.json({ ...data, items: filtered });
}
