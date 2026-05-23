import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

export type AptPositionOverrides = Record<string, { lat: number; lng: number }>;

const KEY = "apt-positions.json";

export async function getAptPositions(): Promise<AptPositionOverrides> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "{}");
  } catch {
    return {};
  }
}

export async function saveAptPositions(data: AptPositionOverrides): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    })
  );
}
