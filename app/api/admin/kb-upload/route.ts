import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { r2, BUCKET } from "@/lib/r2Client";
import { parseWeeklyWorkbook, parseMonthlyWorkbook, buildGeoNamesByPrefix, type GeoFeatureLite } from "@/lib/kbParser";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

function loadGeoNamesByPrefix() {
  const raw = fs.readFileSync(path.join(process.cwd(), "public/skorea-municipalities.geojson"), "utf-8");
  const geo = JSON.parse(raw) as { features: GeoFeatureLite[] };
  return buildGeoNamesByPrefix(geo.features);
}

async function putJson(key: string, data: unknown) {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      CacheControl: "no-cache",
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = form.get("type") as string | null;

    if (!file) return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    if (type !== "weekly" && type !== "monthly") {
      return NextResponse.json({ error: "type은 weekly 또는 monthly여야 합니다" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `파일 크기가 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB → 최대 30MB)` }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const geoNamesByPrefix = loadGeoNamesByPrefix();

    if (type === "weekly") {
      const { weeklySido, weeklySgg, indexSido, indexSgg, supplySido } = parseWeeklyWorkbook(buffer, geoNamesByPrefix);
      await Promise.all([
        putJson("kb-data/kb-weekly-sido.json", weeklySido),
        putJson("kb-data/kb-weekly-sigungu.json", weeklySgg),
        putJson("kb-data/kb-index-sido.json", indexSido),
        putJson("kb-data/kb-index-sigungu.json", indexSgg),
        putJson("kb-data/kb-supply-sido.json", supplySido),
      ]);
      return NextResponse.json({
        ok: true,
        updatedAt: weeklySido.saleChange.updatedAt,
        saleMatched: weeklySgg.saleChange.regions.length,
        jeonseMatched: weeklySgg.jeonseChange.regions.length,
      });
    }

    const { ratioSido, ratioSgg } = parseMonthlyWorkbook(buffer, geoNamesByPrefix);
    await Promise.all([
      putJson("kb-data/kb-ratio-sido.json", ratioSido),
      putJson("kb-data/kb-ratio-sigungu.json", ratioSgg),
    ]);
    return NextResponse.json({
      ok: true,
      updatedAt: ratioSido.ratio.updatedAt,
      ratioMatched: ratioSgg.ratio.regions.length,
    });
  } catch (err) {
    const e = err as Error;
    console.error("[kb-upload] 오류:", e.message, e.stack);
    return NextResponse.json({ error: `처리 중 오류가 발생했습니다: ${e.message}` }, { status: 500 });
  }
}
