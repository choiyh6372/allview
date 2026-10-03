"use client";

import { useEffect, useState } from "react";
import ComplexReviews from "@/components/vr/ComplexReviews";
import type { PublicReview } from "@/lib/reviewUtils";

// 지도 패널 등 클라이언트 화면용: 승인된 후기를 불러와 compact 후기 영역을 그린다
export default function ComplexReviewsLoader({ complexId, complexName }: { complexId: string; complexName: string }) {
  const [reviews, setReviews] = useState<PublicReview[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReviews(null);
    fetch(`/api/reviews?complexId=${encodeURIComponent(complexId)}`)
      .then((r) => r.json())
      .then((data) => !cancelled && setReviews(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setReviews([]));
    return () => {
      cancelled = true;
    };
  }, [complexId]);

  if (!reviews) return <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />;
  return <ComplexReviews key={complexId} complexId={complexId} complexName={complexName} reviews={reviews} compact />;
}
