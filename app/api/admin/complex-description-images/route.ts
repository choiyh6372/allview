import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { r2, BUCKET, R2_PUBLIC_URL } from "@/lib/r2Client";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const complexId = (form.get("complexId") as string) ?? "unknown";

    if (!file) return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `파일 크기가 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB → 최대 10MB)` }, { status: 413 });

    const input = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    try {
      output = await sharp(input)
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: "이미지를 처리할 수 없습니다. 다른 파일을 시도해주세요" }, { status: 400 });
    }

    const key = `complex-descriptions/${complexId}/${Date.now()}.jpg`;
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: output,
        ContentType: "image/jpeg",
      })
    );

    return NextResponse.json({ url: `${R2_PUBLIC_URL}/${key}` });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    console.error("[complex-description-images] 업로드 실패:", { message: e.message, code: e.code });
    return NextResponse.json({ error: "서버 오류로 업로드에 실패했습니다" }, { status: 500 });
  }
}
