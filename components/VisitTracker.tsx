"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (sessionStorage.getItem("av_tracked")) return;
    sessionStorage.setItem("av_tracked", "1");
    fetch("/api/track", { method: "POST" });
  }, [pathname]);
  return null;
}
