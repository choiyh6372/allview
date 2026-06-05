import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

const PREFIX = "trade";

export async function getTradeCache<T>(key: string): Promise<T[] | null> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: `${PREFIX}/${key}.json` })
    );
    const text = await res.Body?.transformToString();
    if (!text) return null;
    return JSON.parse(text) as T[];
  } catch {
    return null;
  }
}

export async function saveTradeCache<T>(key: string, data: T[]): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}/${key}.json`,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    })
  );
}
