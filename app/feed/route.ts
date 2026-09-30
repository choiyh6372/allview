import { rssResponse } from "@/lib/rssFeed";

// /rss.xml과 같은 RSS (블로그 글 + 단지별 VR 페이지 + 주요 페이지)
export const dynamic = "force-dynamic";

export function GET() {
  return rssResponse();
}
