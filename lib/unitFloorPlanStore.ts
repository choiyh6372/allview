import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "./r2Client";

const FLOORPLANS_KEY = "vr/unit-floorplans.json";

// { [complexId]: { [type]: imageUrl } }
export type UnitFloorPlanMap = Record<string, Record<string, string>>;

export async function getUnitFloorPlans(): Promise<UnitFloorPlanMap> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: FLOORPLANS_KEY })
    );
    const text = await res.Body?.transformToString();
    return JSON.parse(text ?? "{}");
  } catch {
    return {};
  }
}

export async function saveUnitFloorPlans(map: UnitFloorPlanMap): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: FLOORPLANS_KEY,
      Body: JSON.stringify(map, null, 2),
      ContentType: "application/json",
    })
  );
}
