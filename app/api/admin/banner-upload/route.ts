import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { r2, BUCKET, R2_PUBLIC_URL } from "@/lib/r2Client";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const storeId = (form.get("storeId") as string) ?? "unknown";
    const position = (form.get("position") as string) ?? "unknown";
    const slot = (form.get("slot") as string) ?? "0";

    if (!file) return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ error: "파일 크기가 너무 큽니다 (최대 10MB)" }, { status: 413 });

    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize(1200, 300, { fit: "cover", position: "center" })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const key = `promotion/${storeId}/banner-${position}-${slot}.jpg`;
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
    console.error(err);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
