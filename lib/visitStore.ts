import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

const KEY = "visits/daily.json";

type DailyVisits = Record<string, string[]>; // "2026-05-29" -> [ip_hash, ...]

async function load(): Promise<DailyVisits> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "{}");
  } catch {
    return {};
  }
}

async function save(data: DailyVisits) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: KEY,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  }));
}

function dateKey(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export async function recordVisit(ipHash: string) {
  const data = await load();
  const key = dateKey(0);
  if (!data[key]) data[key] = [];
  if (!data[key].includes(ipHash)) {
    data[key].push(ipHash);
    // 60일 이상 된 데이터 제거
    const cutoff = dateKey(60);
    for (const k of Object.keys(data)) {
      if (k < cutoff) delete data[k];
    }
    await save(data);
  }
}

export async function getVisitStats() {
  const data = await load();
  let week = 0;
  let month = 0;
  for (let i = 0; i < 7; i++) week += (data[dateKey(i)] ?? []).length;
  for (let i = 0; i < 30; i++) month += (data[dateKey(i)] ?? []).length;

  // 최근 30일 일별 데이터 (차트용)
  const daily = Array.from({ length: 30 }, (_, i) => {
    const k = dateKey(29 - i);
    return { date: k.slice(5), count: (data[k] ?? []).length };
  });

  return {
    today: (data[dateKey(0)] ?? []).length,
    yesterday: (data[dateKey(1)] ?? []).length,
    week,
    month,
    daily,
  };
}
