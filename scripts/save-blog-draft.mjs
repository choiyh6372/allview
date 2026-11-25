// 블로그 글(JSON: slug·title·description·content)을 관리자 API로 저장한다.
// 새 글은 비공개 초안으로 만들고, 이미 있는 글은 본문만 바꾼다(공개 여부·썸네일 유지).
// 사용: node scripts/save-blog-draft.mjs post1.json [post2.json ...]
import fs from "fs";
import crypto from "crypto";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const pw = env.match(/^ADMIN_PASSWORD=(.*)$/m)[1].trim().replace(/^["']|["']$/g, "");
const cookie = "admin_auth=" + crypto.createHash("sha256").update(pw + "_allview_admin").digest("hex");
const base = "https://www.allview.kr/api/admin/blog";

const files = process.argv.slice(2);
const posts = await (await fetch(base, { headers: { cookie } })).json();
const newSlugs = files.map((f) => JSON.parse(fs.readFileSync(f, "utf8")).slug);

for (const f of files) {
  const np = JSON.parse(fs.readFileSync(f, "utf8"));
  const cur = posts.find((p) => p.slug === np.slug);
  const missing = [...np.content.matchAll(/href="\/blog\/([^"]+)"/g)]
    .map((m) => decodeURIComponent(m[1]))
    .filter((s) => !posts.some((p) => p.slug === s) && !newSlugs.includes(s));
  const post = cur
    ? { ...cur, title: np.title, description: np.description, content: np.content }
    : { ...np, thumbnail: "", published: false };
  const res = await fetch(base, {
    method: "PUT",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify(cur ? { originalSlug: np.slug, post } : { post }),
  });
  const saved = await res.json();
  console.log(res.status, cur ? "updated" : "created", np.slug, "| published:", saved.published, missing.length ? `| 없는 링크: ${missing}` : "| 링크 정상");
}
