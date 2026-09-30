import { rssResponse } from "@/lib/rssFeed";

// Search Console에 등록된 RSS 주소 (/rss.xml·/feed와 같은 내용, 리디렉션 없이 바로 응답)
export const dynamic = "force-dynamic";

export function GET() {
  return rssResponse();
}
