import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";
import { JEONGBI_ADDRESS_OVERRIDES } from "./jeongbiAddressOverrides";

const KEY = "jeongbi/address-overrides.json";

export interface JeongbiOverride {
  address?: string;
  gu?: string;
}

type StoredEntry = string | JeongbiOverride;

function toOverride(val: StoredEntry | undefined): JeongbiOverride {
  if (val === undefined) return {};
  if (typeof val === "string") return { address: val };
  return val;
}

export async function getJeongbiOverrides(): Promise<Record<string, JeongbiOverride>> {
  const result: Record<string, JeongbiOverride> = {};
  for (const [k, v] of Object.entries(JEONGBI_ADDRESS_OVERRIDES)) {
    result[k] = { address: v };
  }
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const text = await res.Body?.transformToString();
    const stored = JSON.parse(text ?? "{}") as Record<string, StoredEntry>;
    for (const [k, v] of Object.entries(stored)) {
      result[k] = { ...result[k], ...toOverride(v) };
    }
  } catch {}
  return result;
}

async function loadStoredRaw(): Promise<Record<string, StoredEntry>> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "{}") as Record<string, StoredEntry>;
  } catch {
    return {};
  }
}

export async function saveJeongbiOverride(id: string, patch: JeongbiOverride): Promise<void> {
  const stored = await loadStoredRaw();
  const existing = toOverride(stored[id]);
  stored[id] = { ...existing, ...patch };
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(stored, null, 2),
      ContentType: "application/json",
    })
  );
}
