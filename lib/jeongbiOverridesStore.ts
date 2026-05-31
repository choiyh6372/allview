import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";
import { JEONGBI_ADDRESS_OVERRIDES } from "./jeongbiAddressOverrides";

const KEY = "jeongbi/address-overrides.json";

export async function getJeongbiOverrides(): Promise<Record<string, string>> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const text = await res.Body?.transformToString();
    const stored = JSON.parse(text ?? "{}") as Record<string, string>;
    return { ...JEONGBI_ADDRESS_OVERRIDES, ...stored };
  } catch {
    return { ...JEONGBI_ADDRESS_OVERRIDES };
  }
}

export async function saveJeongbiOverrides(overrides: Record<string, string>): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(overrides, null, 2),
      ContentType: "application/json",
    })
  );
}
