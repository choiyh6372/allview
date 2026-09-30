import { rssResponse } from "@/lib/rssFeed";

// 사이트 RSS (블로그 글 + 단지별 VR 페이지 + 주요 페이지). 예전 뉴스 RSS는 블로그로 대체
export const dynamic = "force-dynamic";

export function GET() {
  return rssResponse();
}
