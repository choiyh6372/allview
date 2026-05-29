import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

const VR_COUNTS_KEY = "vr/counts.json";

export async function getVRCounts(): Promise<Record<string, number>> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: VR_COUNTS_KEY })
    );
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "{}");
  } catch {
    return {};
  }
}

export async function saveVRCounts(counts: Record<string, number>): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: VR_COUNTS_KEY,
      Body: JSON.stringify(counts, null, 2),
      ContentType: "application/json",
    })
  );
}
