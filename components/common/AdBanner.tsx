/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdBannerProps {
  imageUrl: string;
  storeId: string;
  alt?: string;
  compact?: boolean;
}

export default function AdBanner({ imageUrl, storeId, alt = "광고", compact }: AdBannerProps) {
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/map?storeId=${storeId}`)}
      className={`relative block w-full overflow-hidden rounded-xl border border-gray-200 hover:opacity-90 transition-opacity text-left${compact ? "" : ""}`}
    >
      {imgError ? (
        <div className={`w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white ${compact ? "h-16" : "h-24"}`}>
          <span className="text-sm font-semibold">광고</span>
        </div>
      ) : (
        <div className={compact ? "h-28 overflow-hidden" : "aspect-[4/1] overflow-hidden"}>
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-cover"
            draggable={false}
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <span className="absolute top-2 right-2 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">
        광고
      </span>
    </button>
  );
}
