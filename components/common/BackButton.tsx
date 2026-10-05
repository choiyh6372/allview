"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { NAV_COUNT_KEY } from "@/components/common/RouteTracker";

// 이전 페이지로 이동. 사이트 안에서 거쳐 온 페이지가 없으면(링크로 바로 들어옴) fallback 주소로
export default function BackButton({ fallback, label = "뒤로" }: { fallback: string; label?: string }) {
  const router = useRouter();

  function handleClick() {
    let visited = 0;
    try {
      visited = Number(sessionStorage.getItem(NAV_COUNT_KEY) ?? "0");
    } catch {
      visited = 0;
    }
    if (visited > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
    >
      <ChevronLeft size={16} />
      {label}
    </button>
  );
}
