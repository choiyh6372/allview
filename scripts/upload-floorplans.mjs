// 로컬 floorplans/{regionId}/{단지명}/{평형}.jpg 를 R2에 업로드하고
// vr/unit-floorplans.json 스토어에 등록한다.
// 사용법: node scripts/upload-floorplans.mjs <complexId>
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:"), "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  const text = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

function loadComplexes() {
  const text = fs.readFileSync(path.join(ROOT, "lib", "vrData.ts"), "utf8");
  const re = /\{ id: "([^"]+)", slug: "([^"]+)", name: "([^"]+)", regionId: "([^"]+)", regionName: "([^"]+)",\s*\n?\s*types: \[([^\]]*)\]/g;
  const items = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, id, slug, name, regionId, regionName, typesRaw] = m;
    const types = typesRaw.split(",").map((t) => t.trim().replace(/"/g, "")).filter(Boolean);
    items.push({ id, slug, name, regionId, regionName, types });
  }
  return items;
}

async function main() {
  const complexId = process.argv[2];
  if (!complexId) {
    console.error("사용법: node scripts/upload-floorplans.mjs <complexId>");
    process.exit(1);
  }

  const env = loadEnv();
  const complexes = loadComplexes();
  const complex = complexes.find((c) => c.id === complexId);
  if (!complex) {
    console.error(`vrData.ts에서 id "${complexId}"를 찾을 수 없습니다.`);
    process.exit(1);
  }

  const dir = path.join(ROOT, "floorplans", complex.regionId, complex.name);
  if (!fs.existsSync(dir)) {
    console.error(`폴더가 없습니다: ${dir}`);
    process.exit(1);
  }

  const r2 = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
  });
  const BUCKET = env.R2_BUCKET_NAME;
  const PUBLIC_URL = env.R2_PUBLIC_URL || "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev";
  const STORE_KEY = "vr/unit-floorplans.json";

  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`[${complex.name}] ${files.length}개 파일 발견, 등록된 타입: ${complex.types.join(", ")}`);

  const matched = [];
  const unmatched = [];
  for (const file of files) {
    const type = path.basename(file, path.extname(file)).toLowerCase();
    if (complex.types.includes(type)) {
      matched.push({ file, type });
    } else {
      unmatched.push(file);
    }
  }

  if (unmatched.length > 0) {
    console.log(`⚠ 타입과 매칭 안 되는 파일 (건너뜀): ${unmatched.join(", ")}`);
  }
  const missing = complex.types.filter((t) => !matched.some((m) => m.type === t));
  if (missing.length > 0) {
    console.log(`⚠ 아직 파일이 없는 타입: ${missing.join(", ")}`);
  }

  // 기존 스토어 불러오기
  let store = {};
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: STORE_KEY }));
    store = JSON.parse((await res.Body.transformToString()) || "{}");
  } catch {
    store = {};
  }
  store[complex.id] = store[complex.id] || {};

  for (const { file, type } of matched) {
    const input = fs.readFileSync(path.join(dir, file));
    const output = await sharp(input)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const key = `unit-floorplans/${complex.id}/${type}.jpg`;
    await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: output, ContentType: "image/jpeg" }));
    const url = `${PUBLIC_URL}/${key}`;
    store[complex.id][type] = url;
    console.log(`  ✓ ${type} → ${url}`);
  }

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: STORE_KEY,
    Body: JSON.stringify(store, null, 2),
    ContentType: "application/json",
  }));

  console.log(`완료: ${matched.length}개 업로드, 스토어 저장됨.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
