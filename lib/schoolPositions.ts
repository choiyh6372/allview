// 초등학교 마커 좌표 수동 오버라이드
// Places API 결과가 틀린 경우 여기에 학교명(통학구역 제외) → 좌표 추가
export const SCHOOL_POS_OVERRIDES: Record<string, { lat: number; lng: number }> = {
  "명문초": { lat: 35.099417, lng: 128.913964 },
};
