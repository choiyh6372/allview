import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/test", "/vr-editor"],
    },
    sitemap: ["https://www.allview.kr/sitemap.xml", "https://www.allview.kr/rss.xml"],
  };
}
