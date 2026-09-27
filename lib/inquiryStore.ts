import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";
import { INQUIRY_RETENTION_MONTHS } from "./siteInfo";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  content: string;
  createdAt: string;
  read: boolean;
}

const INQUIRIES_KEY = "inquiries/inquiries.json";

export { INQUIRY_RETENTION_MONTHS };

function retentionCutoff(now = new Date()): Date {
  const d = new Date(now);
  d.setMonth(d.getMonth() - INQUIRY_RETENTION_MONTHS);
  return d;
}

/** 보관 기간이 지난 문의를 뺀 목록 */
export function withoutExpired(inquiries: Inquiry[]): Inquiry[] {
  const cutoff = retentionCutoff().getTime();
  return inquiries.filter((i) => new Date(i.createdAt).getTime() >= cutoff);
}

/** 보관 기간이 지난 문의를 저장소에서 삭제하고, 남은 목록과 삭제 건수를 돌려준다 */
export async function purgeExpiredInquiries(): Promise<{ inquiries: Inquiry[]; removed: number }> {
  const all = await getAllInquiries();
  const kept = withoutExpired(all);
  const removed = all.length - kept.length;
  if (removed > 0) await saveAllInquiries(kept);
  return { inquiries: kept, removed };
}

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
