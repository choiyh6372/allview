import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  content: string;
  createdAt: string;
  read: boolean;
}

const INQUIRIES_KEY = "inquiries/inquiries.json";

export async function getAllInquiries(): Promise<Inquiry[]> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: INQUIRIES_KEY })
    );
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "[]");
  } catch {
    return [];
  }
}

export async function saveAllInquiries(inquiries: Inquiry[]): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: INQUIRIES_KEY,
      Body: JSON.stringify(inquiries, null, 2),
      ContentType: "application/json",
    })
  );
}
