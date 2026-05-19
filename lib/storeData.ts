export interface Store {
  id: number;
  name: string;
  category: string;
  region: string;
  rating: number;
  reviewCount: number;
  address: string;
  naverUrl: string;
  tags: string[];
  phone: string;
}

export const categories = [
  "전체", "카페", "음식점", "마트", "헬스", "약국", "미용", "키즈", "베이커리", "세탁", "병원", "학원",
];

export const regions = ["전체", "오션시티", "국제신도시", "에코델타"];

export const stores: Store[] = [
  { id: 1, name: "오션카페", category: "카페", region: "오션시티", rating: 4.8, reviewCount: 312, address: "오션시티 1단지 상가 101호", naverUrl: "https://map.naver.com", tags: ["wifi", "주차"], phone: "051-123-1001" },
  { id: 2, name: "에코마트", category: "마트", region: "에코델타", rating: 4.6, reviewCount: 541, address: "에코델타 2단지 상가 B01", naverUrl: "https://map.naver.com", tags: ["주차", "배달"], phone: "051-123-2001" },
  { id: 3, name: "국제헬스장", category: "헬스", region: "국제신도시", rating: 4.9, reviewCount: 228, address: "국제신도시 A블록 지하1층", naverUrl: "https://map.naver.com", tags: ["GX", "PT"], phone: "051-123-3001" },
  { id: 4, name: "바다횟집", category: "음식점", region: "오션시티", rating: 4.7, reviewCount: 489, address: "오션시티 로데오거리 25", naverUrl: "https://map.naver.com", tags: ["예약", "주차"], phone: "051-123-1002" },
  { id: 5, name: "그린약국", category: "약국", region: "에코델타", rating: 4.5, reviewCount: 133, address: "에코델타 1단지 상가 102호", naverUrl: "https://map.naver.com", tags: ["야간"], phone: "051-123-2002" },
  { id: 6, name: "스타일헤어", category: "미용", region: "국제신도시", rating: 4.8, reviewCount: 276, address: "국제신도시 B타워 상가 204호", naverUrl: "https://map.naver.com", tags: ["예약"], phone: "051-123-3002" },
  { id: 7, name: "키즈카페 붕붕", category: "키즈", region: "에코델타", rating: 4.9, reviewCount: 392, address: "에코델타 스마트시티 상가 1층", naverUrl: "https://map.naver.com", tags: ["주차", "wifi"], phone: "051-123-2003" },
  { id: 8, name: "오션베이커리", category: "베이커리", region: "오션시티", rating: 4.7, reviewCount: 201, address: "오션시티 2단지 상가 105호", naverUrl: "https://map.naver.com", tags: ["배달"], phone: "051-123-1003" },
  { id: 9, name: "국제피자", category: "음식점", region: "국제신도시", rating: 4.6, reviewCount: 344, address: "국제신도시 센트럴파크 앞", naverUrl: "https://map.naver.com", tags: ["배달", "포장"], phone: "051-123-3003" },
  { id: 10, name: "에코세탁소", category: "세탁", region: "에코델타", rating: 4.4, reviewCount: 88, address: "에코델타 1단지 상가 103호", naverUrl: "https://map.naver.com", tags: ["당일"], phone: "051-123-2004" },
  { id: 11, name: "오션소아과", category: "병원", region: "오션시티", rating: 4.8, reviewCount: 167, address: "오션시티 메디컬센터 3층", naverUrl: "https://map.naver.com", tags: ["예약", "주차"], phone: "051-123-1004" },
  { id: 12, name: "국제영어학원", category: "학원", region: "국제신도시", rating: 4.7, reviewCount: 213, address: "국제신도시 A블록 2층", naverUrl: "https://map.naver.com", tags: ["셔틀"], phone: "051-123-3004" },
  { id: 13, name: "에코카페", category: "카페", region: "에코델타", rating: 4.5, reviewCount: 178, address: "에코델타 2단지 상가 201호", naverUrl: "https://map.naver.com", tags: ["wifi", "루프탑"], phone: "051-123-2005" },
  { id: 14, name: "국제마트", category: "마트", region: "국제신도시", rating: 4.6, reviewCount: 422, address: "국제신도시 메인스트리트 12", naverUrl: "https://map.naver.com", tags: ["주차", "배달"], phone: "051-123-3005" },
  { id: 15, name: "오션짜장", category: "음식점", region: "오션시티", rating: 4.5, reviewCount: 289, address: "오션시티 상업지구 33", naverUrl: "https://map.naver.com", tags: ["배달"], phone: "051-123-1005" },
];
