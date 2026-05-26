export interface AptComplex {
  id: string;
  name: string;          // 지도 핀 표시명 (짧고 읽기 쉽게)
  apiName?: string;      // 국토부 아파트 실거래 API aptNm (name과 다를 때만 명시)
  silvApiNames?: string[]; // 국토부 분양권 실거래 API aptNm (apt API와 다를 때 명시)
  region: "ocean" | "kukje" | "ecodelta" | "other";
  regionName: string;
  address: string;
  lat: number;
  lng: number;
}

export const APT_COMPLEXES: AptComplex[] = [
  // ── 명지오션시티 ─────────────────────────────────────────────────────────
  { id: "ocean_blueocean",         name: "엘크루블루오션",   region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티12로 92",  lat: 35.0817093599096, lng: 128.904949139755 },
  { id: "ocean_doosan",            name: "두산위브",          apiName: "명지두산위브포세이돈",             region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티11로 22",  lat: 35.0839998406513, lng: 128.896736933411 },
  { id: "ocean_hansin",            name: "한신휴플러스",      apiName: "명지오션시티한신휴플러스",         region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티1로 155",  lat: 35.0808140745239, lng: 128.901127762161 },
  { id: "ocean_kukdong",           name: "극동스타클래스",    region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티2로 71",   lat: 35.0839533492813, lng: 128.899987733079 },
  { id: "ocean_lotte",             name: "롯데캐슬",          region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티11로 84",  lat: 35.0839924873696, lng: 128.904987654806 },
  { id: "ocean_qweendom_edison",   name: "퀸덤 에디슨",      apiName: "퀸덤1차에디슨타운",               region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티10로 17",  lat: 35.0881501153806, lng: 128.897360747756 },
  { id: "ocean_qweendom_lincoln",  name: "퀸덤 링컨",        apiName: "퀸덤1차링컨타운",                 region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티10로 16",  lat: 35.0863938157981, lng: 128.896787329086 },
  { id: "ocean_qweendom_einstein", name: "퀸덤 아인슈타인",  apiName: "퀸덤1차아인슈타인타운",           region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티11로 51",  lat: 35.0863723143638, lng: 128.899846498513 },
  { id: "ocean_samjung",           name: "삼정그린코아",      apiName: "명지오션시티삼정그린코아",         region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티10로 114", lat: 35.0863305505833, lng: 128.908179867156 },
  { id: "ocean_solmare",           name: "솔마레",            apiName: "엘크루솔마레",                    region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티12로 10",  lat: 35.0817398270463, lng: 128.896597335723 },

  // ── 명지국제신도시 ───────────────────────────────────────────────────────
  { id: "kukje_daebang1",   name: "대방1차",      apiName: "명지대방노블랜드오션뷰1차",          region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 30",  lat: 35.0970088824499, lng: 128.920360599523 },
  { id: "kukje_daebang2",   name: "대방2차",      apiName: "명지대방노블랜드오션뷰2차",          region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 11",  lat: 35.0953281798622, lng: 128.91917534047  },
  { id: "kukje_eileen",     name: "에일린의뜰",   apiName: "에일린의 뜰",                        region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 60",  lat: 35.1004557357605, lng: 128.920892035046 },
  { id: "kukje_elife",      name: "이편한세상",   apiName: "e편한세상명지",                      region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제2로 80",  lat: 35.0987666150386, lng: 128.908422103948 },
  { id: "kukje_hoban1",     name: "호반1차",      apiName: "명지국제신도시호반베르디움1차",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 29",  lat: 35.0968900000000, lng: 128.919630000000 },
  { id: "kukje_hoban2",     name: "호반2차",      apiName: "명지국제신도시호반베르디움2차",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 89",  lat: 35.1023779782121, lng: 128.920192998502 },
  { id: "kukje_hyupsung",   name: "협성휴포레",   apiName: "명지협성휴포레",                     region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 141", lat: 35.1075308265119, lng: 128.921120157931 },
  { id: "kukje_jungheung1", name: "중흥1차",      apiName: "부산명지중흥S-클래스에듀오션",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 133", lat: 35.0964045540988, lng: 128.916710287675 },
  { id: "kukje_jungheung2", name: "중흥2차",      apiName: "부산명지중흥S-클래스프라디움",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 90",  lat: 35.1012700104038, lng: 128.920855108103 },
  { id: "kukje_kumkang1",   name: "금강1차",      apiName: "명지1차 금강펜테리움 센트럴파크",   region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 59",  lat: 35.1007219205582, lng: 128.918669288385 },
  { id: "kukje_kumkang2",   name: "금강2차",      apiName: "명지2차금강펜테리움센트럴파크",      region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 109", lat: 35.1042150316068, lng: 128.919193763803 },
  { id: "kukje_kumkang3",   name: "금강3차",      region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 110", lat: 35.1040778310702, lng: 128.921442769417 },
  { id: "kukje_thehill",    name: "더힐",         apiName: "더힐시그니처",                       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 110", lat: 35.0959304769464, lng: 128.913268117194 },
  { id: "kukje_thewestern", name: "더웨스턴",     apiName: "명지더웨스턴",                       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 111", lat: 35.0967275507,    lng: 128.912899235566 },
  { id: "kukje_samjung",    name: "삼정",         apiName: "명지국제신도시삼정그린코아더베스트", region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제3로 97",  lat: 35.0984996440827, lng: 128.911061063793 },
  { id: "kukje_posco2",     name: "포스코 2단지", apiName: "더샵명지퍼스트월드2단지",            region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 37",  lat: 35.0975218758561, lng: 128.905203069718 },
  { id: "kukje_posco3",     name: "포스코 3단지", apiName: "더샵명지퍼스트월드3단지",            region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제2로 41",  lat: 35.0947817266961, lng: 128.906874174632 },

  // ── 지사동 ───────────────────────────────────────────────────────────────
  { id: "jisa_elysian",   name: "협성DS앨리시안",  apiName: "협성앨리시안",             region: "other", regionName: "지사동", address: "부산 강서구 과학산단로306번길 10", lat: 35.15007, lng: 128.83817 },
  { id: "jisa_kumkang",   name: "지사금강펜테리움", region: "other", regionName: "지사동", address: "부산 강서구 과학산단2로20번길 69",  lat: 35.15156, lng: 128.83848 },
  { id: "jisa_humansia",  name: "지사휴먼시아",    apiName: "부산지사휴먼시아",          region: "other", regionName: "지사동", address: "부산 강서구 과학산단2로20번길 35",  lat: 35.15169, lng: 128.83371 },

  // ── 에코델타시티 ─────────────────────────────────────────────────────────
  { id: "ecodelta_hoban",         name: "호반써밋",             apiName: "에코델타호반써밋스마트시티", silvApiNames: ["부산에코델타 7BL 호반써밋"],                                                   region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코대로 243",    lat: 35.1383113368126, lng: 128.907294875642 },
  { id: "ecodelta_sujain",        name: "수자인",               apiName: "에코델타스마트시티수자인",   silvApiNames: ["부산 에코델타시티 한양수자인"],                                                region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코중앙1로 33",  lat: 35.1396035183419, lng: 128.916467746097 },
  { id: "ecodelta_prugio_lin",    name: "푸르지오린",           silvApiNames: ["에코델타시티 푸르지오 린", "에코델타시티푸르지오린"],                                                               region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타3로 43",  lat: 35.1428719245537, lng: 128.920043691156 },
  { id: "ecodelta_xi",            name: "강서자이",             apiName: "강서자이에코델타",            silvApiNames: ["강서자이에코델타", "강서자이 에코델타(20블록)"],                              region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타1로 24",  lat: 35.1432134027804, lng: 128.914188933677 },
  { id: "ecodelta_elife",         name: "이편한세상센터포인트", silvApiNames: ["이편한세상에코델타센터포인트", "e편한세상 에코델타 센터포인트"],                                                      region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타1로 42",  lat: 35.1453818415594, lng: 128.914411759665 },
  { id: "ecodelta_prugio_center", name: "푸르지오센터파크",     silvApiNames: ["에코델타시티 푸르지오 센터파크", "에코델타시티푸르지오센터파크"],                                                   region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타1로 66",  lat: 35.1476705701951, lng: 128.914698422940 },
  { id: "ecodelta_theberhill",    name: "더베르힐",             silvApiNames: ["에코델타더베르힐", "에코델타시티 대성베르힐 17BL"],                                                                   region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타5로 60",  lat: 35.1498659152938, lng: 128.915778407351 },
  { id: "ecodelta_jungheung",     name: "중흥S클래스",          silvApiNames: ["부산 에코델타시티 16블록 중흥S-클래스"],                                                                              region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4428-4",   lat: 35.1529328656849, lng: 128.915292689267 },
  { id: "ecodelta_dietr_grand",   name: "디에트르그랑루체",     silvApiNames: ["부산에코델타시티 디에트르 그랑루체(13BL)"],                                                                          region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4277",     lat: 35.1581754649920, lng: 128.917512514883 },
  { id: "ecodelta_dietr_first",   name: "디에트르더퍼스트",     silvApiNames: ["부산에코델타시티 디에트르 더 퍼스트(28BL)"],                                                                         region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4677-2",   lat: 35.1497955200891, lng: 128.922411247680 },
  { id: "ecodelta_atheara",       name: "아테라",               silvApiNames: ["에코델타시티 아테라(24BL)"],                                                                                                      region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4680-4",   lat: 35.1499452788496, lng: 128.919474638227 },
  { id: "ecodelta_daebang",       name: "대방엘리움리버뷰",     silvApiNames: ["부산에코델타시티 대방 엘리움 리버뷰"],                                                                                             region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 대저2동 5428-9",  lat: 35.1405523816491, lng: 128.927407692621 },
];

export const REGION_COLORS: Record<AptComplex["region"], string> = {
  ocean:    "#5b6ef5",
  kukje:    "#22c55e",
  ecodelta: "#f59e0b",
  other:    "#6b7280",
};

export const REGION_NAME_COLORS: Record<string, string> = {
  "신호동": "#8b5cf6",
  "화전동": "#06b6d4",
  "지사동": "#10b981",
  "대저동": "#f43f5e",
};

export const REGION_CENTER: Partial<Record<AptComplex["region"], { lat: number; lng: number; level: number }>> & Record<"ocean" | "kukje" | "ecodelta", { lat: number; lng: number; level: number }> = {
  ocean:    { lat: 35.0848, lng: 128.9009, level: 5 },
  kukje:    { lat: 35.1013, lng: 128.9159, level: 5 },
  ecodelta: { lat: 35.1488, lng: 128.9154, level: 5 },
};

export const MAP_DEFAULT = { lat: 35.1060, lng: 128.9100, level: 8 };
