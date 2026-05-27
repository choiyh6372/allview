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
  // 국토부 공동주택 기본정보 (AptBasisInfoServiceV4)
  kaptCode?: string;
  hoCnt?: number;        // 세대수
  buildYear?: number;    // 건축연도
  parkingCnt?: number;   // 주차대수
  heatType?: string;     // 난방방식
  dongCnt?: number;      // 동수
  evChargerCnt?: number; // 전기차 충전기 수 (kaptdEcntp)
  officeTel?: string;    // 관리사무소 전화
  legalAddress?: string; // 법정동 주소
}

export const APT_COMPLEXES: AptComplex[] = [
  // ── 명지오션시티 ─────────────────────────────────────────────────────────
  { id: "ocean_blueocean4",        name: "엘크루블루오션 4단지", apiName: "엘크루블루오션", region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티6로 33",   lat: 35.0840733257291, lng: 128.908345234621, kaptCode: "A61870407", legalAddress: "부산광역시 강서구 명지동 3243", hoCnt: 414,  buildYear: 2012, heatType: "중앙난방", dongCnt: 17, evChargerCnt: 25, officeTel: "0512712262" },
  { id: "ocean_blueocean5",        name: "엘크루블루오션 5단지", apiName: "엘크루블루오션", region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티12로 92",  lat: 35.0817093599096, lng: 128.904949139755, kaptCode: "A61870409", legalAddress: "부산광역시 강서구 명지동 3241", hoCnt: 375,  buildYear: 2012, heatType: "중앙난방", dongCnt: 14, evChargerCnt: 23, officeTel: "0512712263" },
  { id: "ocean_blueocean6",        name: "엘크루블루오션 6단지", apiName: "엘크루블루오션", region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티12로 120", lat: 35.0817497038607, lng: 128.908291649572, kaptCode: "A61870408", legalAddress: "부산광역시 강서구 명지동 3242", hoCnt: 252,  buildYear: 2012, heatType: "중앙난방", dongCnt: 13, evChargerCnt: 18, officeTel: "0512712264" },
  { id: "ocean_doosan",            name: "두산위브",          apiName: "명지두산위브포세이돈",             region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티11로 22",  lat: 35.0839998406513, lng: 128.896736933411, kaptCode: "A61870410", legalAddress: "부산광역시 강서구 명지동 3234", hoCnt: 1256, buildYear: 2013, parkingCnt: 1256, heatType: "개별난방", dongCnt: 16, evChargerCnt: 45, officeTel: "0512713787" },
  { id: "ocean_hansin",            name: "한신휴플러스",      apiName: "명지오션시티한신휴플러스",         region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티1로 155",  lat: 35.0808140745239, lng: 128.901127762161, kaptCode: "A61870411", legalAddress: "부산광역시 강서구 명지동 3236", hoCnt: 841,  buildYear: 2014, parkingCnt: 841,  heatType: "개별난방", dongCnt: 29, evChargerCnt: 14, officeTel: "0512712750" },
  { id: "ocean_kukdong",           name: "극동스타클래스",    region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티2로 71",   lat: 35.0839533492813, lng: 128.899987733079, kaptCode: "A61881402", legalAddress: "부산광역시 강서구 명지동 3233", hoCnt: 1138, buildYear: 2008, parkingCnt: 1124, heatType: "개별난방", dongCnt: 21, evChargerCnt: 41, officeTel: "0512712142" },
  { id: "ocean_lotte",             name: "롯데캐슬",          region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티11로 84",  lat: 35.0839924873696, lng: 128.904987654806, kaptCode: "A61820001", legalAddress: "부산광역시 강서구 명지동 3244", hoCnt: 1133, buildYear: 2008, parkingCnt: 1122, heatType: "개별난방", dongCnt: 16, evChargerCnt: 40, officeTel: "0512063428" },
  { id: "ocean_qweendom_edison",   name: "퀸덤 에디슨",      apiName: "퀸덤1차에디슨타운",               region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티10로 17",  lat: 35.0881501153806, lng: 128.897360747756, kaptCode: "A61870406", legalAddress: "부산광역시 강서구 명지동 3230-11", hoCnt: 652,  buildYear: 2009, parkingCnt: 652,  heatType: "지역난방", dongCnt: 11, evChargerCnt: 20, officeTel: "0512710541" },
  { id: "ocean_qweendom_lincoln",  name: "퀸덤 링컨",        apiName: "퀸덤1차링컨타운",                 region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티10로 16",  lat: 35.0863938157981, lng: 128.896787329086, kaptCode: "A61870405", legalAddress: "부산광역시 강서구 명지동 3231", hoCnt: 1102, buildYear: 2009, parkingCnt: 1102, heatType: "지역난방", dongCnt: 17, evChargerCnt: 29, officeTel: "0512717170" },
  { id: "ocean_qweendom_einstein", name: "퀸덤 아인슈타인",  apiName: "퀸덤1차아인슈타인타운",           region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티11로 51",  lat: 35.0863723143638, lng: 128.899846498513, kaptCode: "A61870404", legalAddress: "부산광역시 강서구 명지동 3232", hoCnt: 1112, buildYear: 2009, parkingCnt: 1112, heatType: "지역난방", dongCnt: 17, evChargerCnt: 29, officeTel: "0512717781" },
  { id: "ocean_samjung",           name: "삼정그린코아",      apiName: "명지오션시티삼정그린코아",         region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티10로 114", lat: 35.0863305505833, lng: 128.908179867156, kaptCode: "A10028117", legalAddress: "부산광역시 강서구 명지동 3246", hoCnt: 610,  buildYear: 2014, parkingCnt: 610,  heatType: "개별난방", dongCnt: 13, evChargerCnt: 30, officeTel: "0512936668" },
  { id: "ocean_solmare",           name: "솔마레",            apiName: "엘크루솔마레",                    region: "ocean", regionName: "명지오션시티", address: "부산 강서구 명지오션시티12로 10",  lat: 35.0817398270463, lng: 128.896597335723, kaptCode: "A10028079", legalAddress: "부산광역시 강서구 명지동 3235", hoCnt: 480,  buildYear: 2014, parkingCnt: 480,  heatType: "개별난방", dongCnt: 13, evChargerCnt: 32, officeTel: "0512713999" },

  // ── 명지국제신도시 ───────────────────────────────────────────────────────
  { id: "kukje_daebang1",   name: "대방1차",      apiName: "명지대방노블랜드오션뷰1차",          region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 30",  lat: 35.0970088824499, lng: 128.920360599523, kaptCode: "A10027656", legalAddress: "부산광역시 강서구 명지동 2609-5", hoCnt: 737,  buildYear: 2015, parkingCnt: 737,  heatType: "지역난방", dongCnt: 11, evChargerCnt: 23, officeTel: "0512715561" },
  { id: "kukje_daebang2",   name: "대방2차",      apiName: "명지대방노블랜드오션뷰2차",          region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 11",  lat: 35.0953281798622, lng: 128.91917534047,  kaptCode: "A10027581", legalAddress: "부산광역시 강서구 명지동 3417", hoCnt: 600,  buildYear: 2016, parkingCnt: 600,  heatType: "지역난방", dongCnt: 8,  evChargerCnt: 17, officeTel: "0512948705" },
  { id: "kukje_eileen",     name: "에일린의뜰",   apiName: "에일린의 뜰",                        region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 60",  lat: 35.1004557357605, lng: 128.920892035046, kaptCode: "A10027953", legalAddress: "부산광역시 강서구 명지동 1647-1", hoCnt: 980,  buildYear: 2015, parkingCnt: 980,  heatType: "지역난방", dongCnt: 13, evChargerCnt: 27, officeTel: "0512918855" },
  { id: "kukje_elife",      name: "이편한세상",   apiName: "e편한세상명지",                      region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제2로 80",  lat: 35.0987666150386, lng: 128.908422103948, kaptCode: "A10025684", legalAddress: "부산광역시 강서구 명지동 3599-1", hoCnt: 377,  buildYear: 2019, parkingCnt: 377,  heatType: "지역난방", dongCnt: 4,  evChargerCnt: 9,  officeTel: "0512011231" },
  { id: "kukje_hoban1",     name: "호반1차",      apiName: "명지국제신도시호반베르디움1차",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 29",  lat: 35.0968900000000, lng: 128.919630000000, kaptCode: "A10027698", legalAddress: "부산광역시 강서구 명지동 2484", hoCnt: 642,  buildYear: 2016, parkingCnt: 642,  heatType: "지역난방", dongCnt: 8,  evChargerCnt: 16, officeTel: "0512718826" },
  { id: "kukje_hoban2",     name: "호반2차",      apiName: "명지국제신도시호반베르디움2차",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 89",  lat: 35.1023779782121, lng: 128.920192998502, kaptCode: "A10027139", legalAddress: "부산광역시 강서구 명지동 3344", hoCnt: 694,  buildYear: 2017, parkingCnt: 694,  heatType: "지역난방", dongCnt: 6,  evChargerCnt: 1,  officeTel: "0512712766" },
  { id: "kukje_hyupsung",   name: "협성휴포레",   apiName: "명지협성휴포레",                     region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 141", lat: 35.1075308265119, lng: 128.921120157931, kaptCode: "A10027280", legalAddress: "부산광역시 강서구 명지동 3328", hoCnt: 1664, buildYear: 2016, parkingCnt: 1664, heatType: "지역난방", dongCnt: 28, evChargerCnt: 38, officeTel: "0512922846" },
  { id: "kukje_jungheung1", name: "중흥1차",      apiName: "부산명지중흥S-클래스프라디움",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 133", lat: 35.0964045540988, lng: 128.916710287675, kaptCode: "A10027282", legalAddress: "부산광역시 강서구 명지동 3400", hoCnt: 1033, buildYear: 2016, parkingCnt: 1033, heatType: "지역난방", dongCnt: 9,  officeTel: "0512711202" },
  { id: "kukje_jungheung2", name: "중흥2차",      apiName: "부산명지중흥S-클래스에듀오션",       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 90",  lat: 35.1012700104038, lng: 128.920855108103, kaptCode: "A10026445", legalAddress: "부산광역시 강서구 명지동 3350", hoCnt: 750,  buildYear: 2018, parkingCnt: 750,  heatType: "지역난방", dongCnt: 12, officeTel: "0512015923" },
  { id: "kukje_kumkang1",   name: "금강1차",      apiName: "명지1차 금강펜테리움 센트럴파크",   region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 59",  lat: 35.1007219205582, lng: 128.918669288385, kaptCode: "A10027918", legalAddress: "부산광역시 강서구 명지동 1690-1", hoCnt: 850,  buildYear: 2015, parkingCnt: 850,  heatType: "지역난방", dongCnt: 8,  evChargerCnt: 16, officeTel: "0512711571" },
  { id: "kukje_kumkang2",   name: "금강2차",      apiName: "명지2차금강펜테리움센트럴파크",      region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 109", lat: 35.1042150316068, lng: 128.919193763803, kaptCode: "A10027621", legalAddress: "부산광역시 강서구 명지동 1131-1", hoCnt: 670,  buildYear: 2016, parkingCnt: 670,  heatType: "지역난방", dongCnt: 6,  evChargerCnt: 12, officeTel: "0512070401" },
  { id: "kukje_kumkang3",   name: "금강3차",      region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제5로 110", lat: 35.1040778310702, lng: 128.921442769417, kaptCode: "A10025932", legalAddress: "부산광역시 강서구 명지동 3347", hoCnt: 870,  buildYear: 2018, parkingCnt: 870,  heatType: "지역난방", dongCnt: 12, officeTel: "0512014521" },
  { id: "kukje_thehill",    name: "더힐",         apiName: "더힐시그니처",                       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 110", lat: 35.0959304769464, lng: 128.913268117194, kaptCode: "A10025776", legalAddress: "부산광역시 강서구 명지동 3404", hoCnt: 1210, buildYear: 2019, parkingCnt: 1210, heatType: "지역난방", dongCnt: 16, evChargerCnt: 32, officeTel: "0512713577" },
  { id: "kukje_thewestern", name: "더웨스턴",     apiName: "명지더웨스턴",                       region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 111", lat: 35.0967275507,    lng: 128.912899235566, kaptCode: "A10026157", legalAddress: "부산광역시 강서구 명지동 3399", hoCnt: 1213, buildYear: 2018, parkingCnt: 1201, heatType: "지역난방", dongCnt: 11, evChargerCnt: 33, officeTel: "0512015976" },
  { id: "kukje_samjung",    name: "삼정",         apiName: "명지국제신도시삼정그린코아더베스트", region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제3로 97",  lat: 35.0984996440827, lng: 128.911061063793, kaptCode: "A10025343", legalAddress: "부산광역시 강서구 명지동 3599-3", hoCnt: 431,  buildYear: 2019, parkingCnt: 431,  heatType: "지역난방", dongCnt: 4,  evChargerCnt: 9,  officeTel: "0512062920" },
  { id: "kukje_posco2",     name: "포스코 2단지", apiName: "더샵명지퍼스트월드2단지",            region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제7로 37",  lat: 35.0975218758561, lng: 128.905203069718, kaptCode: "A10024697", legalAddress: "부산광역시 강서구 명지동 3594", hoCnt: 1406, buildYear: 2020, parkingCnt: 1406, heatType: "지역난방", dongCnt: 11, evChargerCnt: 50, officeTel: "0512932224" },
  { id: "kukje_posco3",     name: "포스코 3단지", apiName: "더샵명지퍼스트월드3단지",            region: "kukje", regionName: "명지국제신도시", address: "부산 강서구 명지국제2로 41",  lat: 35.0947817266961, lng: 128.906874174632, kaptCode: "A10024664", legalAddress: "부산광역시 강서구 명지동 3595-3", hoCnt: 1530, buildYear: 2020, parkingCnt: 1530, heatType: "지역난방", dongCnt: 9,  evChargerCnt: 23, officeTel: "0517100802" },

  // ── 지사동 ───────────────────────────────────────────────────────────────
  { id: "jisa_elysian",   name: "협성DS엘리시안",  apiName: "협성·DS엘리시안",          region: "other", regionName: "지사동", address: "부산 강서구 과학산단로306번길 10", lat: 35.15007, lng: 128.83817, kaptCode: "A10028069", legalAddress: "부산광역시 강서구 지사동 1186", hoCnt: 1277, buildYear: 2015, parkingCnt: 1277, heatType: "개별난방", dongCnt: 14, evChargerCnt: 35, officeTel: "0519412725" },
  { id: "jisa_kumkang",   name: "지사금강펜테리움", region: "other", regionName: "지사동", address: "부산 강서구 과학산단2로20번길 69",  lat: 35.15156, lng: 128.83848, kaptCode: "A61823002", legalAddress: "부산광역시 강서구 지사동 1184-1", hoCnt: 1111, buildYear: 2013, parkingCnt: 1111, heatType: "개별난방", dongCnt: 17, evChargerCnt: 27, officeTel: "0519411184" },
  { id: "jisa_humansia",  name: "지사휴먼시아",    apiName: "부산지사휴먼시아",          region: "other", regionName: "지사동", address: "부산 강서구 과학산단2로20번길 35",  lat: 35.15169, lng: 128.83371, kaptCode: "A61823001", legalAddress: "부산광역시 강서구 지사동 1183-1", hoCnt: 961,  buildYear: 2011, parkingCnt: 961,  heatType: "개별난방", dongCnt: 8,  evChargerCnt: 19, officeTel: "0518325121" },

  // ── 에코델타시티 ─────────────────────────────────────────────────────────
  { id: "ecodelta_hoban",         name: "호반써밋",             apiName: "에코델타호반써밋스마트시티", silvApiNames: ["부산에코델타 7BL 호반써밋"],                                                   region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코대로 243",    lat: 35.1383113368126, lng: 128.907294875642, kaptCode: "A10022696", legalAddress: "부산광역시 강서구 강동동 5076-5", hoCnt: 526,  buildYear: 2024, parkingCnt: 526,  heatType: "지역난방", dongCnt: 9,  evChargerCnt: 14, officeTel: "0519735580" },
  { id: "ecodelta_sujain",        name: "수자인",               apiName: "에코델타스마트시티수자인",   silvApiNames: ["부산 에코델타시티 한양수자인"],                                                region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코중앙1로 33",  lat: 35.1396035183419, lng: 128.916467746097, kaptCode: "A10022541", legalAddress: "부산광역시 강서구 강동동 5058-9", hoCnt: 554,  buildYear: 2024, parkingCnt: 554,  heatType: "지역난방", dongCnt: 7,  evChargerCnt: 16, officeTel: "0519722920" },
  { id: "ecodelta_prugio_lin",    name: "푸르지오린",           silvApiNames: ["에코델타시티 푸르지오 린", "에코델타시티푸르지오린"],                                                               region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타3로 43",  lat: 35.1428719245537, lng: 128.920043691156, kaptCode: "A10020378", legalAddress: "부산광역시 강서구 강동동", hoCnt: 895,  buildYear: 2025, heatType: "지역난방", dongCnt: 14, officeTel: "0519736663" },
  { id: "ecodelta_xi",            name: "강서자이",             apiName: "강서자이에코델타",            silvApiNames: ["강서자이에코델타", "강서자이 에코델타(20블록)"],                              region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타1로 24",  lat: 35.1432134027804, lng: 128.914188933677, kaptCode: "A10020645", legalAddress: "부산광역시 강서구 강동동", hoCnt: 856,  buildYear: 2025, heatType: "지역난방", dongCnt: 10, officeTel: "0517102653" },
  { id: "ecodelta_elife",         name: "이편한세상센터포인트", silvApiNames: ["이편한세상에코델타센터포인트", "e편한세상 에코델타 센터포인트"],                                                      region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타1로 42",  lat: 35.1453818415594, lng: 128.914411759665, kaptCode: "A10020649", legalAddress: "부산광역시 강서구 강동동", hoCnt: 953,  buildYear: 2025, heatType: "지역난방", dongCnt: 15, officeTel: "0519739735" },
  { id: "ecodelta_prugio_center", name: "푸르지오센터파크",     silvApiNames: ["에코델타시티 푸르지오 센터파크", "에코델타시티푸르지오센터파크"],                                                   region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타1로 66",  lat: 35.1476705701951, lng: 128.914698422940, kaptCode: "A10020569", legalAddress: "부산광역시 강서구 강동동", hoCnt: 972,  buildYear: 2025, heatType: "지역난방", dongCnt: 13, officeTel: "0519410178" },
  { id: "ecodelta_theberhill",    name: "더베르힐",             silvApiNames: ["에코델타더베르힐", "에코델타시티 대성베르힐 17BL"],                                                                   region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 에코델타5로 60",  lat: 35.1498659152938, lng: 128.915778407351, kaptCode: "A10020264", legalAddress: "부산광역시 강서구 강동동 4685-1", hoCnt: 1120, buildYear: 2026, parkingCnt: 1120, heatType: "지역난방", dongCnt: 16, evChargerCnt: 32, officeTel: "0518313990" },
  { id: "ecodelta_jungheung",     name: "중흥S클래스",          silvApiNames: ["부산 에코델타시티 16블록 중흥S-클래스"],                                                                              region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4428-4",   lat: 35.1529328656849, lng: 128.915292689267 },
  { id: "ecodelta_dietr_grand",   name: "디에트르그랑루체",     silvApiNames: ["부산에코델타시티 디에트르 그랑루체(13BL)"],                                                                          region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4277",     lat: 35.1581754649920, lng: 128.917512514883 },
  { id: "ecodelta_dietr_first",   name: "디에트르더퍼스트",     silvApiNames: ["부산에코델타시티 디에트르 더 퍼스트(28BL)"],                                                                         region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4677-2",   lat: 35.1497955200891, lng: 128.922411247680 },
  { id: "ecodelta_atheara",       name: "아테라",               silvApiNames: ["에코델타시티 아테라(24BL)"],                                                                                          region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 강동동 4680-4",   lat: 35.1499452788496, lng: 128.919474638227 },
  { id: "ecodelta_daebang",       name: "대방엘리움리버뷰",     silvApiNames: ["부산에코델타시티 대방 엘리움 리버뷰"],                                                                               region: "ecodelta", regionName: "에코델타시티", address: "부산 강서구 대저2동 5428-9",  lat: 35.1405523816491, lng: 128.927407692621 },
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
