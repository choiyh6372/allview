import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

const DESCRIPTIONS_KEY = "vr/descriptions.json";

export async function getComplexDescriptions(): Promise<Record<string, string>> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: DESCRIPTIONS_KEY })
    );
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "{}");
  } catch {
    return {};
  }
}

export async function saveComplexDescriptions(descriptions: Record<string, string>): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: DESCRIPTIONS_KEY,
      Body: JSON.stringify(descriptions, null, 2),
      ContentType: "application/json",
    })
  );
}
