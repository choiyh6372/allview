"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 이 탭에서 사이트 안 페이지를 몇 번 거쳤는지 기록 (뒤로가기 버튼이 사이트 안 이전 페이지가 있는지 판단할 때 사용)
export const NAV_COUNT_KEY = "av_nav_count";

export default function RouteTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const n = Number(sessionStorage.getItem(NAV_COUNT_KEY) ?? "0");
      sessionStorage.setItem(NAV_COUNT_KEY, String(n + 1));
    } catch {
      // 저장소를 못 쓰면 뒤로가기는 fallback으로 동작
    }
  }, [pathname]);
  return null;
}
