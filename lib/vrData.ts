export const R2_BASE = "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev";

export interface VRComplex {
  id: string;
  slug: string;
  name: string;
  regionId: string;
  regionName: string;
  types: string[];
}

export const complexData: VRComplex[] = [
  // 오션시티 (ocean)
  { id: "ocean_blueocean", slug: "blueocean", name: "블루오션", regionId: "ocean", regionName: "오션시티",
    types: ["46a","46b","54a","54b","64","65","66","67a","68a","68b","69b","76","77","78","79","87a","87b","88a","88b"] },
  { id: "ocean_doosan", slug: "doosan", name: "두산위브", regionId: "ocean", regionName: "오션시티",
    types: ["28","33a","33b","33c","33d","49"] },
  { id: "ocean_hansin", slug: "hansin", name: "한신더휴", regionId: "ocean", regionName: "오션시티",
    types: ["29a","29b","33a","33b","33c","33d","33e"] },
  { id: "ocean_kukdong", slug: "kukdong", name: "극동", regionId: "ocean", regionName: "오션시티",
    types: ["34a","34b","34c","39a","39b","39c","43","49","59"] },
  { id: "ocean_lotte", slug: "lotte", name: "롯데캐슬", regionId: "ocean", regionName: "오션시티",
    types: ["33a","33b","38","46a","46b","54"] },
  { id: "ocean_qweendom", slug: "qweendom", name: "퀸덤", regionId: "ocean", regionName: "오션시티",
    types: ["33a","33b","34a","34b","39a","39b","39c","39d","46a","46b","46c","55"] },
  { id: "ocean_samjung", slug: "samjung", name: "삼정", regionId: "ocean", regionName: "오션시티",
    types: ["28","31","34a","34b","39"] },
  { id: "ocean_solmare", slug: "solmare", name: "솔마레", regionId: "ocean", regionName: "오션시티",
    types: ["29","32","33a","33b","33c","36","36a","36b","39","42"] },
  // 국제신도시 (kukje)
  { id: "kukje_daebang1", slug: "daebang1", name: "대방1차", regionId: "kukje", regionName: "국제신도시",
    types: ["34a","34b"] },
  { id: "kukje_daebang2", slug: "daebang2", name: "대방2차", regionId: "kukje", regionName: "국제신도시",
    types: ["34a"] },
  { id: "kukje_eileen", slug: "eileen", name: "에일린의뜰", regionId: "kukje", regionName: "국제신도시",
    types: ["33a","33b"] },
  { id: "kukje_elife", slug: "elife", name: "이편한세상", regionId: "kukje", regionName: "국제신도시",
    types: ["39c"] },
  { id: "kukje_hoban2", slug: "hoban2", name: "호반2차", regionId: "kukje", regionName: "국제신도시",
    types: ["28c","33"] },
  { id: "kukje_hyupsung", slug: "hyupsung", name: "협성", regionId: "kukje", regionName: "국제신도시",
    types: ["22a","24b","24c"] },
  { id: "kukje_jungheung1", slug: "jungheung1", name: "중흥1차", regionId: "kukje", regionName: "국제신도시",
    types: ["25a","25a top","25a1","25c","25d"] },
  { id: "kukje_jungheung2", slug: "jungheung2", name: "중흥2차", regionId: "kukje", regionName: "국제신도시",
    types: ["34"] },
  { id: "kukje_kumkang1", slug: "kumkang1", name: "금강1차", regionId: "kukje", regionName: "국제신도시",
    types: ["34a"] },
  { id: "kukje_kumkang2", slug: "kumkang2", name: "금강2차", regionId: "kukje", regionName: "국제신도시",
    types: ["33a"] },
  { id: "kukje_kumkang3", slug: "kumkang3", name: "금강3차", regionId: "kukje", regionName: "국제신도시",
    types: ["25a","25b","25c","25c1"] },
  { id: "kukje_thehill", slug: "thehill", name: "더힐", regionId: "kukje", regionName: "국제신도시",
    types: ["33","49a","49b","49c"] },
  { id: "kukje_thewestern", slug: "thewestern", name: "더웨스턴", regionId: "kukje", regionName: "국제신도시",
    types: ["31a1","31a2","35a2","35b"] },
  { id: "kukje_samjung", slug: "samjung", name: "삼정", regionId: "kukje", regionName: "국제신도시",
    types: ["40a","40b","45a"] },
  { id: "kukje_posco", slug: "posco", name: "포스코", regionId: "kukje", regionName: "국제신도시",
    types: ["34a","34b","40","46"] },
];

export function getVRUrl(regionId: string, slug: string, type: string): string {
  return `${R2_BASE}/${regionId}/${slug}/${encodeURIComponent(type)}/vtour/tour.html`;
}
