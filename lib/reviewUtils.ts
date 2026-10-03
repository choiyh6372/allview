// 단지 한줄 후기 타입·검증 (클라이언트에서도 import 가능 — 서버 전용 코드 금지)

/** 후기 기능을 켠 단지 (테스트: 극동스타클래스) */
export const REVIEW_ENABLED_COMPLEXES = ["ocean_kukdong"];

export const REVIEW_MAX_LENGTH = 300;
export const REVIEW_MIN_LENGTH = 5;
export const NICKNAME_MAX_LENGTH = 12;

export type ReviewStatus = "pending" | "approved" | "hidden";

/** 사이트에 공개되는 후기 */
export interface PublicReview {
  id: string;
  complexId: string;
  nickname: string;
  content: string;
  createdAt: string;
}

/** 저장되는 후기 (비밀번호 해시·IP 해시 포함, 공개 금지) */
export interface StoredReview extends PublicReview {
  status: ReviewStatus;
  passwordHash: string;
  ipHash: string;
}

export function isReviewEnabled(complexId: string): boolean {
  return REVIEW_ENABLED_COMPLEXES.includes(complexId);
}

const URL_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|kr|co|io|me|ly|xyz|shop)\b)/i;
const PHONE_PATTERN = /(01[016789]|0\d{1,2})[-.\s]?\d{3,4}[-.\s]?\d{4}/;

/** 작성 내용 검증. 문제가 있으면 사용자에게 보여줄 메시지를 돌려준다 */
export function validateReviewInput(input: {
  nickname?: string;
  content?: string;
  password?: string;
}): string | null {
  const nickname = input.nickname?.trim() ?? "";
  const content = input.content?.trim() ?? "";
  if (!nickname) return "닉네임을 입력해주세요.";
  if (nickname.length > NICKNAME_MAX_LENGTH) return `닉네임은 ${NICKNAME_MAX_LENGTH}자 이내로 입력해주세요.`;
  if (content.length < REVIEW_MIN_LENGTH) return `후기는 ${REVIEW_MIN_LENGTH}자 이상 입력해주세요.`;
  if (content.length > REVIEW_MAX_LENGTH) return `후기는 ${REVIEW_MAX_LENGTH}자 이내로 입력해주세요.`;
  if (URL_PATTERN.test(content) || URL_PATTERN.test(nickname)) return "링크(주소)는 입력할 수 없습니다.";
  if (PHONE_PATTERN.test(content.replace(/\s/g, " "))) return "전화번호는 입력할 수 없습니다.";
  if (!input.password || input.password.length < 4) return "삭제용 비밀번호를 4자 이상 입력해주세요.";
  return null;
}

export function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
