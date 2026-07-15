import { MetadataRoute } from "next";
import { complexData } from "@/lib/vrData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://allview.kr";

  const complexPages: MetadataRoute.Sitemap = complexData.map((complex) => ({
    url: `${baseUrl}/vr-tour/${complex.regionId}/${complex.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
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
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...complexPages,
  ];
}
