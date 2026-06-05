"use client";

import { useRouter } from "next/navigation";
import { complexData } from "@/lib/vrData";
import FloorPlanView from "@/components/vr/FloorPlanView";
import StoreBanner from "@/components/home/StoreBanner";

export default function VRComplexPage({ params }: { params: { regionId: string; slug: string } }) {
  const { regionId, slug } = params;
  const router = useRouter();

  const complex = complexData.find((c) => c.regionId === regionId && c.slug === slug);

  if (!complex) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500">
        단지를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FloorPlanView complex={complex} onBack={() => router.push(`/vr-tour?region=${encodeURIComponent(complex.regionName)}`)} />
      </div>
      <StoreBanner />
    </>
  );
}
