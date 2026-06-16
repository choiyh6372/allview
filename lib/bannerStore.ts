import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

export interface AdBannerItem {
  id: string;
  position: "real-estate" | "map";
  slot: number;
  imageUrl: string;
  phone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const BANNERS_KEY = "admin/banners.json";

export async function getAllBanners(): Promise<AdBannerItem[]> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: BANNERS_KEY })
    );
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "[]");
  } catch {
    return [];
  }
}

export async function saveAllBanners(banners: AdBannerItem[]): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: BANNERS_KEY,
      Body: JSON.stringify(banners, null, 2),
      ContentType: "application/json",
    })
  );
}
