import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

export const BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev";

export function urlToKey(url: string): string {
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}

export async function deleteKey(key: string): Promise<void> {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    // ignore missing files
  }
}
