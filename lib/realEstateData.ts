export interface Transaction {
  date: string;
  area: string;
  floor: number;
  price: number;
}

export interface MonthlyPrice {
  month: string;
  median: number;
  low: number;
  high: number;
}

export interface Complex {
  id: number;
  name: string;
  region: string;
  areas: string[];
  monthlyPrices: MonthlyPrice[];
  transactions: Transaction[];
  vrUrl?: string;
  /** 국토부 API 매칭용 아파트명 키워드 (공백 무시하여 비교) */
  aptKeywords?: string[];
  /** 법정동코드 (기본 26440: 부산 강서구) */
  lawdCd?: string;
}

const baseComplexes: Omit<Complex, "monthlyPrices" | "transactions">[] = [
  {
    id: 1, name: "오션시티 1단지", region: "오션시티", areas: ["59", "84", "101"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["오션시티자이"], lawdCd: "26440",
  },
  {
    id: 2, name: "오션시티 2단지", region: "오션시티", areas: ["59", "74", "84"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["오션시티더샵", "오션시티e편한세상"], lawdCd: "26440",
  },
  {
    id: 3, name: "오션파크 타워", region: "오션시티", areas: ["100", "130"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["오션파크"], lawdCd: "26440",
  },
  {
    id: 4, name: "국제신도시 A블록", region: "국제신도시", areas: ["74", "84", "99"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["국제1차아이파크", "국제2차아이파크", "국제3차아이파크"], lawdCd: "26440",
  },
  {
    id: 5, name: "국제신도시 B타워", region: "국제신도시", areas: ["84", "110"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["국제롯데캐슬", "국제반도유보라"], lawdCd: "26440",
  },
  {
    id: 6, name: "에코델타 1단지", region: "에코델타", areas: ["84", "110"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["에코델타시티금성백조", "에코델타시티예미지"], lawdCd: "26440",
  },
  {
    id: 7, name: "에코델타 2단지", region: "에코델타", areas: ["59", "74", "84"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["에코델타시티한신더휴", "에코델타시티중흥"], lawdCd: "26440",
  },
  {
    id: 8, name: "에코스마트시티", region: "에코델타", areas: ["84", "99"],
    vrUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    aptKeywords: ["에코델타시티푸르지오", "에코델타시티힐스테이트"], lawdCd: "26440",
  },
];

export const complexData: Complex[] = baseComplexes.map((c) => ({
  ...c,
  monthlyPrices: [],
  transactions: [],
}));
