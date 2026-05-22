/** apt_mapping.txt 기준 지역별 전체 평형 수 (VR 완성도 분모) */
export const APT_MAPPING_TOTALS: Record<string, number> = {
  ocean:    76,
  kukje:    76,
  ecodelta: 70,
};

/** VR 단지 ID (regionId_slug) → 평형 타입 → 전용면적(㎡, 정수) */
export const VR_AREA_MAP: Record<string, Record<string, number>> = {
  // 오션시티
  ocean_blueocean: {
    "46a": 125, "46b": 124,
    "54a": 148, "54b": 148,
    "64": 180, "65": 181, "66": 180,
    "67a": 186, "68a": 190, "68b": 190, "69b": 190,
    "76": 211, "77": 211, "78": 220, "79": 220,
    "87a": 245, "87b": 244,
    "88a": 245, "88b": 244,
  },
  ocean_doosan: {
    "28": 71,
    "33a": 85, "33b": 85, "33c": 85, "33d": 85,
    "49": 128,
  },
  ocean_hansin: {
    "29a": 75, "29b": 75,
    "33a": 85, "33b": 85, "33c": 85, "33d": 85, "33e": 85,
  },
  ocean_kukdong: {
    "34a": 85, "34b": 85, "34c": 85,
    "39a": 102, "39b": 102, "39c": 102,
    "43": 114, "49": 134, "59": 150,
  },
  ocean_lotte: {
    "33a": 85, "33b": 85, "38": 102, "46a": 126, "46b": 127, "54": 148,
  },
  ocean_qweendom: {
    "33a": 85, "33b": 85, "34a": 85, "34b": 85,
    "39a": 102, "39b": 102, "39c": 101, "39d": 102,
    "46a": 117, "46b": 117, "46c": 116, "55": 145,
  },
  ocean_samjung: {
    "28": 71, "31": 79, "34a": 85, "34b": 85, "39": 98,
  },
  ocean_solmare: {
    "29": 73, "32": 79,
    "33a": 85, "33b": 85, "33c": 85,
    "36": 92, "36a": 91, "36b": 91,
    "39": 102, "42": 109,
  },
  // 국제신도시
  kukje_daebang1: { "34a": 85, "34b": 85 },
  kukje_daebang2: { "34a": 85 },
  kukje_eileen:   { "33a": 85, "33b": 85 },
  kukje_elife:    { "39c": 99 },
  kukje_hoban2:   { "28c": 71, "33": 85 },
  kukje_hyupsung: { "22a": 54, "24b": 60, "24c": 60 },
  kukje_jungheung1: {
    "25a": 60, "25a top": 60, "25a1": 60, "25c": 60, "25d": 60,
  },
  kukje_jungheung2: { "34": 85 },
  kukje_kumkang1:   { "34a": 84 },
  kukje_kumkang2:   { "33a": 84 },
  kukje_kumkang3:   { "25a": 60, "25b": 60, "25c": 60, "25c1": 60 },
  kukje_posco:      { "34a": 85, "34b": 85, "40": 100, "46": 114 },
  kukje_samjung:    { "40a": 101, "40b": 102, "45a": 113 },
  kukje_thehill:    { "33": 92, "49a": 136, "49b": 136, "49c": 135 },
  kukje_thewestern: { "31a1": 75, "31a2": 75, "35a2": 85, "35b": 85 },
};
