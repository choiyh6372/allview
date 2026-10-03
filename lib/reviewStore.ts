import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";
import type { PublicReview, ReviewAuthorType, ReviewStatus, StoredReview } from "./reviewUtils";

// 후기 1건 = R2 객체 1개 (reviews/{complexId}/{id}.json)
// 파일 하나에 모아 저장하면 동시 작성 시 서로 덮어쓰므로 건별로 저장한다.
const PREFIX = "reviews/";
const keyOf = (complexId: string, id: string) => `${PREFIX}${complexId}/${id}.json`;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = scryptSync(password, salt, 32);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.ADMIN_PASSWORD ?? "salt")).digest("hex").slice(0, 16);
}

export function toPublic(r: StoredReview): PublicReview {
  const { id, complexId, nickname, authorType, content, createdAt } = r;
  return { id, complexId, nickname, authorType, content, createdAt };
}

async function readReview(key: string): Promise<StoredReview | null> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return JSON.parse((await res.Body?.transformToString()) ?? "null");
  } catch {
    return null;
  }
}

async function writeReview(review: StoredReview): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: keyOf(review.complexId, review.id),
      Body: JSON.stringify(review),
      ContentType: "application/json",
    })
  );
}

/** complexId를 주면 그 단지만, 없으면 전체 후기 (최신순) */
export async function listReviews(complexId?: string): Promise<StoredReview[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await r2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: complexId ? `${PREFIX}${complexId}/` : PREFIX,
        ContinuationToken: token,
      })
    );
    for (const o of res.Contents ?? []) if (o.Key?.endsWith(".json")) keys.push(o.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  const reviews = (await Promise.all(keys.map(readReview))).filter((r): r is StoredReview => r !== null);
  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listApprovedReviews(complexId: string): Promise<PublicReview[]> {
  try {
    return (await listReviews(complexId)).filter((r) => r.status === "approved").map(toPublic);
  } catch {
    return [];
  }
}

export async function createReview(input: {
  complexId: string;
  nickname: string;
  authorType: ReviewAuthorType;
  content: string;
  password: string;
  ipHash: string;
}): Promise<StoredReview> {
  const now = new Date();
  const review: StoredReview = {
    id: `${now.getTime()}-${randomBytes(3).toString("hex")}`,
    complexId: input.complexId,
    nickname: input.nickname.trim(),
    authorType: input.authorType,
    content: input.content.trim(),
    createdAt: now.toISOString(),
    status: "pending",
    passwordHash: hashPassword(input.password),
    ipHash: input.ipHash,
  };
  await writeReview(review);
  return review;
}

export async function setReviewStatus(complexId: string, id: string, status: ReviewStatus): Promise<StoredReview | null> {
  const review = await readReview(keyOf(complexId, id));
  if (!review) return null;
  review.status = status;
  await writeReview(review);
  return review;
}

export async function deleteReview(complexId: string, id: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: keyOf(complexId, id) }));
}

/** 작성자가 비밀번호로 자기 후기 삭제 */
export async function deleteReviewWithPassword(complexId: string, id: string, password: string): Promise<boolean> {
  const review = await readReview(keyOf(complexId, id));
  if (!review || !verifyPassword(password, review.passwordHash)) return false;
  await deleteReview(complexId, id);
  return true;
}
