import { MessageSquareText, ChevronDown } from "lucide-react";
import type { PublicReview } from "@/lib/reviewUtils";

// 배치도 아래 한 줄 안내: 후기 수 + 최근 후기 미리보기 → #reviews로 이동
export default function ReviewTeaser({ reviews }: { reviews: PublicReview[] }) {
  const latest = reviews[0];
  return (
    <a
      href="#reviews"
      className="mt-6 max-w-4xl mx-auto flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-bg-card hover:border-accent/40 transition-colors text-sm"
    >
      <MessageSquareText size={16} className="shrink-0 text-accent" />
      <span className="shrink-0 font-semibold text-gray-900">한줄 후기 {reviews.length}개</span>
      <span className="flex-1 min-w-0 truncate text-muted">
        {latest ? `· 최근: ${latest.content}` : "· 첫 후기를 남겨주세요"}
      </span>
      <ChevronDown size={15} className="shrink-0 text-muted" />
    </a>
  );
}
