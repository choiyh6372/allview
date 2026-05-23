import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

export interface PromotionStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  naverUrl: string;
  category: string;
  region: string;
  photos: string[];
  lat?: number;
  lng?: number;
  promotionDays?: number;
  promotionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const STORE_CATEGORIES = [
  "카페", "음식점", "마트", "헬스", "약국",
  "미용", "키즈", "베이커리", "세탁", "병원", "학원", "기타",
];

export const STORE_REGIONS = ["오션시티", "국제신도시", "에코델타"];

const STORES_KEY = "promotion/stores.json";

export async function getAllStores(): Promise<PromotionStore[]> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: STORES_KEY })
    );
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "[]");
  } catch {
    return [];
  }
}

export async function saveAllStores(stores: PromotionStore[]): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: STORES_KEY,
      Body: JSON.stringify(stores, null, 2),
      ContentType: "application/json",
    })
  );
}
