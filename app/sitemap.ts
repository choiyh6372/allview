import { MetadataRoute } from "next";
import { complexData } from "@/lib/vrData";
import { getTradeRecordCounts, MIN_RECORDS_FOR_INDEX, TRADE_PAGE_COMPLEXES } from "@/lib/complexTrades";
import { getPublishedPosts } from "@/lib/blogStore";
import { getActiveStores } from "@/lib/promotionStore";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.allview.kr";

  const complexPages: MetadataRoute.Sitemap = complexData.map((complex) => ({
    url: `${baseUrl}/vr-tour/${complex.regionId}/${complex.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 거래 기록이 거의 없는 단지 페이지(noindex)는 제외
  const [tradeCounts, stores] = await Promise.all([getTradeRecordCounts(), getActiveStores()]);
  const tradePages: MetadataRoute.Sitemap = complexData
    .filter((complex) => TRADE_PAGE_COMPLEXES.includes(complex.id) && (tradeCounts[complex.id] ?? 0) >= MIN_RECORDS_FOR_INDEX)
    .map((complex) => ({
      url: `${baseUrl}/real-estate/${complex.regionId}/${complex.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }));

  // 지역별 시세 비교 페이지
  const regionPages: MetadataRoute.Sitemap = ["ocean", "kukje", "ecodelta"].map((regionId) => ({
    url: `${baseUrl}/real-estate/${regionId}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (await getPublishedPosts()).map((post) => ({
    url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/vr-tour`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/real-estate`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...blogPages,
    ...(stores.length > 0 ? [{
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }] : []),
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscription`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...["/about", "/contact", "/credits", "/terms", "/privacy"].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...complexPages,
    ...regionPages,
    ...tradePages,
  ];
}
