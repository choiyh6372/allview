import proj4 from "proj4";
import * as shapefile from "shapefile";
import iconv from "iconv-lite";
import fs from "fs";
import path from "path";

const EPSG5186 = "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
const WGS84 = "+proj=longlat +datum=WGS84 +no_defs";

const shpPath = path.resolve("LSMD_CONT_UD602_부산/LSMD_CONT_UD602_26_202605.shp");
const dbfPath = path.resolve("LSMD_CONT_UD602_부산/LSMD_CONT_UD602_26_202605.dbf");

function convertRing(ring) {
  return ring.map(([x, y]) => {
    const [lng, lat] = proj4(EPSG5186, WGS84, [x, y]);
    return [+lng.toFixed(7), +lat.toFixed(7)];
  });
}

function convertGeometry(geometry) {
  if (!geometry) return geometry;
  if (geometry.type === "Polygon") {
    return { ...geometry, coordinates: geometry.coordinates.map(convertRing) };
  }
  if (geometry.type === "MultiPolygon") {
    return { ...geometry, coordinates: geometry.coordinates.map((p) => p.map(convertRing)) };
  }
  return geometry;
}

const features = [];
function cleanStr(s) {
  if (!s) return "";
  return s.replace(/\0/g, "").trim();
}

function extractType(name) {
  if (name.includes("재건축")) return "재건축";
  if (name.includes("재개발")) return "재개발";
  if (name.includes("주거환경개선")) return "주거환경개선";
  if (name.includes("주거환경관리")) return "주거환경관리";
  if (name.includes("도시환경")) return "도시환경정비";
  if (name.includes("정비기반시설")) return "기반시설";
  return "기타";
}

const source = await shapefile.open(shpPath, dbfPath, { encoding: "EUC-KR" });

while (true) {
  const result = await source.read();
  if (result.done) break;
  const f = result.value;
  const alias = cleanStr(f.properties.ALIAS);
  const remark = cleanStr(f.properties.REMARK);
  const name = alias || remark;
  features.push({
    type: "Feature",
    geometry: convertGeometry(f.geometry),
    properties: {
      name,
      type: extractType(name),
      admCode: f.properties.COL_ADM_SE,
      mnum: cleanStr(f.properties.MNUM),
    },
  });
}

const geojson = { type: "FeatureCollection", features };
const outputPath = path.resolve("public/jeongbi-busan-wgs84.geojson");
fs.writeFileSync(outputPath, JSON.stringify(geojson));
console.log(`변환 완료: ${features.length}개 구역`);

// 샘플 출력
const samples = features.filter(f => f.properties.ALIAS).slice(0, 5);
samples.forEach(f => console.log(f.properties.ALIAS, "|", f.geometry.coordinates[0][0]));
