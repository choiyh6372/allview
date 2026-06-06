import fs from "fs";
import path from "path";

export type AreaTypeMap = Record<string, Record<string, string>>;

export function parseAptMapping(): AreaTypeMap {
  const filePath = path.join(process.cwd(), "apt_mapping.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  const result: AreaTypeMap = {};
  let currentApt = "";

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#")) {
      currentApt = line.slice(1).trim();
      result[currentApt] = result[currentApt] ?? {};
      continue;
    }

    if (!currentApt) continue;

    // 형식: area:letter:"label" 또는 area: letter :"label"
    const match = line.match(/^([\d.]+)\s*:\s*([A-Za-z][A-Za-z\d]*)\s*:/);
    if (match) {
      const area = String(parseFloat(match[1]));
      const letter = match[2].toUpperCase();
      result[currentApt][area] = letter;
    }
  }

  return result;
}
