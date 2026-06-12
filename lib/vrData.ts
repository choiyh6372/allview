export const R2_BASE = "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev";

export interface VRComplex {
  id: string;
  slug: string;
  name: string;
  regionId: string;
  regionName: string;
  types: string[];
  noVR?: true;
}

export const complexData: VRComplex[] = [
  // 명지오션시티 (ocean)
  { id: "ocean_blueocean4", slug: "blueocean4", name: "엘크루블루오션 4단지", regionId: "ocean", regionName: "명지오션시티",
    types: ["46a","46b","54a","54b","65","66","69b","76","78","79","88b"] },
  { id: "ocean_blueocean5", slug: "blueocean5", name: "엘크루블루오션 5단지", regionId: "ocean", regionName: "명지오션시티",
    types: ["46b","54a","54b","64","66","68a","77","78","88a","88b"] },
  { id: "ocean_blueocean6", slug: "blueocean6", name: "엘크루블루오션 6단지", regionId: "ocean", regionName: "명지오션시티",
    types: ["46a","46b","54a","54b","65","66","67a","69b","76","78","79","87a","88b"] },
  { id: "ocean_doosan", slug: "doosan", name: "두산위브", regionId: "ocean", regionName: "명지오션시티",
    types: ["28","33a","33b","33c","33d","49"] },
  { id: "ocean_hansin", slug: "hansin", name: "한신휴플러스", regionId: "ocean", regionName: "명지오션시티",
    types: ["29a","29b","33a","33b","33c","33d","33e"] },
  { id: "ocean_kukdong", slug: "kukdong", name: "극동", regionId: "ocean", regionName: "명지오션시티",
    types: ["34a","34b","34c","39a","39b","39c","43","49","59","85"] },
  { id: "ocean_lotte", slug: "lotte", name: "롯데캐슬", regionId: "ocean", regionName: "명지오션시티",
    types: ["33a","33b","38","46a","46b","54"] },
  { id: "ocean_qweendom_edison", slug: "qweendom_edison", name: "퀸덤 에디슨", regionId: "ocean", regionName: "명지오션시티",
    types: ["33a","33b","34a","34b","39c","39d","46a","55","87"] },
  { id: "ocean_qweendom_lincoln", slug: "qweendom_lincoln", name: "퀸덤 링컨", regionId: "ocean", regionName: "명지오션시티",
    types: ["33a","33b","34a","34b","39a","39b","39c","39d","46a","46b","46c","55","87"] },
  { id: "ocean_qweendom_einstein", slug: "qweendom_einstein", name: "퀸덤 아인슈타인", regionId: "ocean", regionName: "명지오션시티",
    types: ["33a","33b","39a","39c","39d","46a","46c","55"] },
  { id: "ocean_samjung", slug: "samjung", name: "삼정", regionId: "ocean", regionName: "명지오션시티",
    types: ["28","31","34a","34b","39"] },
  { id: "ocean_solmare", slug: "solmare", name: "솔마레", regionId: "ocean", regionName: "명지오션시티",
    types: ["29","32","33a","33b","33c","36","36a","36b","39","42"] },
  // 명지국제신도시 (kukje)
  { id: "kukje_daebang1", slug: "daebang1", name: "대방1차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["34a","34b"] },
  { id: "kukje_daebang2", slug: "daebang2", name: "대방2차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["34a","34b"] },
  { id: "kukje_eileen", slug: "eileen", name: "에일린의뜰", regionId: "kukje", regionName: "명지국제신도시",
    types: ["26","29a","29b","33a","33b"] },
  { id: "kukje_elife", slug: "elife", name: "이편한세상", regionId: "kukje", regionName: "명지국제신도시",
    types: ["34a","34b","34c","39a","39b","39c"] },
  { id: "kukje_hoban1", slug: "hoban1", name: "호반1차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["27","30a","30b","34"], noVR: true },
  { id: "kukje_hoban2", slug: "hoban2", name: "호반2차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["28a","28b","28c","33"] },
  { id: "kukje_hyupsung", slug: "hyupsung", name: "협성", regionId: "kukje", regionName: "명지국제신도시",
    types: ["22a","22a1","24b","24b1","24c","24d"] },
  { id: "kukje_jungheung1", slug: "jungheung1", name: "중흥1차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["25a","25a1","25b","25b1","25c","25d","25e"] },
  { id: "kukje_jungheung2", slug: "jungheung2", name: "중흥2차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["27","30a","30b","34"] },
  { id: "kukje_kumkang1", slug: "kumkang1", name: "금강1차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["26a","27b","34a","34b","34c"] },
  { id: "kukje_kumkang2", slug: "kumkang2", name: "금강2차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["26a","26b","26c","33a","33b"] },
  { id: "kukje_kumkang3", slug: "kumkang3", name: "금강3차", regionId: "kukje", regionName: "명지국제신도시",
    types: ["25a","25b","25c","25c1"] },
  { id: "kukje_thehill", slug: "thehill", name: "더힐", regionId: "kukje", regionName: "명지국제신도시",
    types: ["33","49a","49b","49c"] },
  { id: "kukje_thewestern", slug: "thewestern", name: "더웨스턴", regionId: "kukje", regionName: "명지국제신도시",
    types: ["31a1","31a2","31b","35a1","35a2","35b"] },
  { id: "kukje_samjung", slug: "samjung", name: "삼정", regionId: "kukje", regionName: "명지국제신도시",
    types: ["34a","34b","40a","40b","45a","45b"] },
  { id: "kukje_posco2", slug: "posco2", name: "포스코 2단지", regionId: "kukje", regionName: "명지국제신도시",
    types: ["32a","34a","34b","40","46"] },
  { id: "kukje_posco3", slug: "posco3", name: "포스코 3단지", regionId: "kukje", regionName: "명지국제신도시",
    types: ["32a","32b","34a","34b","40","46"] },
  { id: "kukje_jungheung_terrace", slug: "jungheung_terrace", name: "중흥더테라스", regionId: "kukje", regionName: "명지국제신도시",
    types: ["84a1","84a2","84a3","84a4","84b1","84b2","84b3","84b4"] },
  { id: "kukje_sweetpalace", slug: "sweetpalace", name: "스위트팰리스", regionId: "kukje", regionName: "명지국제신도시",
    types: ["74a","74a1","74b","84a"] },
  // 에코델타시티 (ecodelta)
  { id: "ecodelta_hoban", slug: "hoban", name: "호반써밋스마트시티", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["33a","33b","33c"] },
  { id: "ecodelta_sujain", slug: "sujain", name: "수자인", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["38a","40a","49a","49b","49c"] },
  { id: "ecodelta_prugio_lin", slug: "prugio_lin", name: "푸르지오린", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["33a1","33a2","33a3","33a4","33b","37","37t1","37t2","38","40","42"] },
  { id: "ecodelta_xi", slug: "xi", name: "강서자이", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["28a","28b","33a","33b","33c","33d","33e","33f"] },
  { id: "ecodelta_elife", slug: "elife", name: "이편한세상센터포인트", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["27a","27b","28","32a","32b","33a","33b","33c","33p"] },
  { id: "ecodelta_prugio_center", slug: "prugio_center", name: "푸르지오센터파크", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["30a","30b","33a","33b","33c","33d","33e","33f","33g","33t"] },
  { id: "ecodelta_theberhill", slug: "theberhill", name: "더베르힐", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["33a","33a1","33ap","33b","33c","39","39p"] },
  { id: "ecodelta_dietr_grand", slug: "dietr_grand", name: "디에트르그랑루체", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["25a","25b","35a","35b","45a","45b"] },
  { id: "ecodelta_dietr_first", slug: "dietr_first", name: "디에트르더퍼스트", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["34a","34b","34c","43a","43b","43c"] },
  { id: "ecodelta_jungheung2", slug: "jungheung_ecodelta", name: "중흥S클래스에코델타시티", regionId: "ecodelta", regionName: "에코델타시티",
    types: ["33a","33b","33c","39a","39b"] },
];

export function getVRUrl(regionId: string, slug: string, type: string): string {
  return `${R2_BASE}/${regionId}/${slug}/${encodeURIComponent(type)}/vtour/tour.html`;
}
