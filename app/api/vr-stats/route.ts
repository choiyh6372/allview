import { NextResponse } from "next/server";
import { APT_MAPPING_TOTALS } from "@/lib/vrAreaMapping";
import { complexData, R2_BASE } from "@/lib/vrData";

export const revalidate = 86400;

const REGION_LABELS: Record<string, string> = {
  ocean:    "명지오션시티",
  kukje:    "명지국제신도시",
  ecodelta: "에코델타시티",
};

export async function GET() {
  const checks: { regionId: string; slug: string; type: string }[] = [];

  for (const complex of complexData) {
    for (const type of complex.types) {
      checks.push({ regionId: complex.regionId, slug: complex.slug, type });
    }
  }

  const results = await Promise.all(
    checks.map(async ({ regionId, slug, type }) => {
      const url = `${R2_BASE}/${regionId}/${slug}/${encodeURIComponent(type)}/vtour/tour.html`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { method: "HEAD", signal: controller.signal });
        clearTimeout(timer);
        return { regionId, available: res.ok };
      } catch {
        return { regionId, available: false };
      }
    })
  );

  const available: Record<string, number> = {};
  for (const { regionId, available: ok } of results) {
    if (ok) available[regionId] = (available[regionId] ?? 0) + 1;
  }

  const stats = ["ocean", "kukje", "ecodelta"].map((id) => ({
    id,
    label: REGION_LABELS[id],
    total: APT_MAPPING_TOTALS[id] ?? 0,
    available: available[id] ?? 0,
  }));

  return NextResponse.json(stats);
}
