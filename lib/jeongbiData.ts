export interface JeongbiProject {
  id: string;
  name: string;
  type: "재개발" | "재건축" | "도시환경정비" | "주거환경개선";
  status: "추진위" | "조합설립" | "사업시행" | "관리처분" | "착공" | "준공" | "해제";
  gu: string;
  address: string;
  lat?: number;
  lng?: number;
  totalHo?: number;
  contractor?: string;
  telNo?: string;
}

export const JEONGBI_PROJECTS: JeongbiProject[] = [
  // 동구
  { id: "j01", name: "좌천범일1통합", type: "재개발", status: "사업시행", gu: "동구", address: "부산광역시 동구 좌천동", lat: 35.1292, lng: 129.0502, totalHo: 2800 },
  { id: "j02", name: "범일4구역", type: "재개발", status: "관리처분", gu: "동구", address: "부산광역시 동구 범일동", lat: 35.1248, lng: 129.0564, totalHo: 1200 },
  { id: "j03", name: "수정1구역", type: "재개발", status: "조합설립", gu: "동구", address: "부산광역시 동구 수정동", lat: 35.1388, lng: 129.0543 },
  // 부산진구
  { id: "j04", name: "범천1구역", type: "재개발", status: "사업시행", gu: "부산진구", address: "부산광역시 부산진구 범천동", lat: 35.1362, lng: 129.0446, totalHo: 1500 },
  { id: "j05", name: "전포3구역", type: "재개발", status: "조합설립", gu: "부산진구", address: "부산광역시 부산진구 전포동", lat: 35.1572, lng: 129.0605 },
  // 북구
  { id: "j06", name: "만덕3구역", type: "재개발", status: "사업시행", gu: "북구", address: "부산광역시 북구 만덕동", lat: 35.2002, lng: 128.9981, totalHo: 900 },
  { id: "j07", name: "화명1구역", type: "재개발", status: "착공", gu: "북구", address: "부산광역시 북구 화명동", lat: 35.2328, lng: 129.0032, totalHo: 1100 },
  // 사하구
  { id: "j08", name: "신평장림1구역", type: "재개발", status: "관리처분", gu: "사하구", address: "부산광역시 사하구 신평동", lat: 35.0885, lng: 128.9642, totalHo: 800 },
  { id: "j09", name: "신평장림2구역", type: "재개발", status: "사업시행", gu: "사하구", address: "부산광역시 사하구 장림동", lat: 35.0845, lng: 128.9702 },
  { id: "j10", name: "괴정지구", type: "재개발", status: "추진위", gu: "사하구", address: "부산광역시 사하구 괴정동", lat: 35.1022, lng: 128.9849 },
  // 사상구
  { id: "j11", name: "감전지구", type: "재개발", status: "조합설립", gu: "사상구", address: "부산광역시 사상구 감전동", lat: 35.1638, lng: 128.9887, totalHo: 600 },
  // 연제구
  { id: "j12", name: "거제3구역", type: "재개발", status: "사업시행", gu: "연제구", address: "부산광역시 연제구 거제동", lat: 35.1842, lng: 129.0722, totalHo: 1800 },
  { id: "j13", name: "연산2구역", type: "재개발", status: "추진위", gu: "연제구", address: "부산광역시 연제구 연산동", lat: 35.1932, lng: 129.0782 },
  // 서구
  { id: "j14", name: "아미2구역", type: "재개발", status: "추진위", gu: "서구", address: "부산광역시 서구 아미동", lat: 35.1040, lng: 129.0172 },
  // 남구
  { id: "j15", name: "대연3구역", type: "재개발", status: "착공", gu: "남구", address: "부산광역시 남구 대연동", lat: 35.1315, lng: 129.0850, totalHo: 2100 },
  // 동래구
  { id: "j16", name: "명륜3구역", type: "재개발", status: "관리처분", gu: "동래구", address: "부산광역시 동래구 명륜동", lat: 35.2073, lng: 129.0852, totalHo: 1300 },
  // 해운대구
  { id: "j17", name: "우동1차", type: "재건축", status: "관리처분", gu: "해운대구", address: "부산광역시 해운대구 우동", lat: 35.1623, lng: 129.1645, totalHo: 500 },
  { id: "j18", name: "좌동 재건축", type: "재건축", status: "조합설립", gu: "해운대구", address: "부산광역시 해운대구 좌동", lat: 35.1840, lng: 129.1703 },
  // 수영구
  { id: "j19", name: "망미주공", type: "재건축", status: "사업시행", gu: "수영구", address: "부산광역시 수영구 망미동", lat: 35.1748, lng: 129.1023, totalHo: 1600 },
  { id: "j20", name: "광안리 재건축", type: "재건축", status: "추진위", gu: "수영구", address: "부산광역시 수영구 광안동", lat: 35.1542, lng: 129.1189 },
  // 남구
  { id: "j21", name: "용호3차", type: "재건축", status: "사업시행", gu: "남구", address: "부산광역시 남구 용호동", lat: 35.1168, lng: 129.1050, totalHo: 700 },
  // 동래구
  { id: "j22", name: "온천4구역", type: "재건축", status: "조합설립", gu: "동래구", address: "부산광역시 동래구 온천동", lat: 35.2005, lng: 129.0748 },
  // 영도구
  { id: "j23", name: "청학지구", type: "재개발", status: "추진위", gu: "영도구", address: "부산광역시 영도구 청학동", lat: 35.0887, lng: 129.0628 },
  // 중구
  { id: "j24", name: "광복 도시환경정비", type: "도시환경정비", status: "착공", gu: "중구", address: "부산광역시 중구 광복동", lat: 35.1012, lng: 129.0302 },
];

export const JEONGBI_TYPE_COLOR: Record<JeongbiProject["type"], string> = {
  "재개발":       "#ef4444",
  "재건축":       "#f97316",
  "도시환경정비": "#8b5cf6",
  "주거환경개선": "#06b6d4",
};

export const JEONGBI_TYPE_ICON: Record<JeongbiProject["type"], string> = {
  "재개발":       "🏚️",
  "재건축":       "🔨",
  "도시환경정비": "🏢",
  "주거환경개선": "🏘️",
};
