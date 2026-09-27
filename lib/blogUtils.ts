// 블로그 타입·도우미 (클라이언트에서도 import 가능 — 서버 전용 코드 금지)

export interface BlogPost {
  slug: string;
  title: string;
  /** 검색 결과·목록에 보이는 요약 (meta description) */
  description: string;
  /** 본문 HTML */
  content: string;
  /** 대표 이미지 URL. 없으면 본문 첫 이미지를 쓴다 */
  thumbnail?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 글 제목으로 URL 슬러그 생성 (한글 유지, 공백은 하이픈) */
export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-z가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function isValidSlug(slug: string): boolean {
  return /^[0-9a-zA-Z가-힣-]{1,80}$/.test(slug);
}

/** 대표 이미지: 지정값 → 본문 첫 번째 <img> */
export function postThumbnail(post: Pick<BlogPost, "thumbnail" | "content">): string | undefined {
  if (post.thumbnail) return post.thumbnail;
  return post.content.match(/<img[^>]+src="([^"]+)"/i)?.[1];
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
