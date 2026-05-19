"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function VRTourError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
      <p className="text-5xl mb-6">⚠️</p>
      <h1 className="text-2xl font-black text-white mb-3">VR 투어를 불러올 수 없습니다</h1>
      <p className="text-gray-400 mb-8">잠시 후 다시 시도하거나 홈으로 돌아가세요.</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl text-sm transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-bg-card border border-border hover:border-accent/40 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
