"use client";

import useSWR from "swr";
import AdBanner from "./AdBanner";

interface BannerData {
  storeId: string;
  position: "real-estate" | "map";
  slot: 1 | 2;
  imageUrl: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  position: "real-estate" | "map";
  slot: 1 | 2;
  compact?: boolean;
}

export default function BannerSlot({ position, slot, compact }: Props) {
  const { data } = useSWR<BannerData[]>(
    `/api/banners?position=${position}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  const banner = data?.find((b) => b.slot === slot);
  if (!banner) return null;
  return <AdBanner imageUrl={banner.imageUrl} storeId={banner.storeId} compact={compact} />;
}
