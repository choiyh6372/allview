import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

import type { BlogPost } from "./blogUtils";

export type { BlogPost } from "./blogUtils";
export { slugify, isValidSlug, postThumbnail, formatPostDate } from "./blogUtils";

const POSTS_KEY = "blog/posts.json";

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }));
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "[]");
  } catch {
    return [];
  }
}

export async function saveAllPosts(posts: BlogPost[]): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: POSTS_KEY,
      Body: JSON.stringify(posts, null, 2),
      ContentType: "application/json",
    })
  );
}

/** 공개된 글만 최신순으로 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublishedPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug && p.published);
}
