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

function genPrices(base: number, months = 24): MonthlyPrice[] {
  const result: MonthlyPrice[] = [];
  let current = base;
  const now = new Date(2026, 4, 1);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    const delta = (Math.random() - 0.45) * base * 0.04;
    current = Math.max(base * 0.7, current + delta);
    result.push({
      month: label,
      median: Math.round(current / 100) * 100,
      low: Math.round((current * 0.92) / 100) * 100,
      high: Math.round((current * 1.08) / 100) * 100,
    });
  }
  return result;
}

function genTransactions(complex: Omit<Complex, "transactions" | "monthlyPrices">): Transaction[] {
  const areas = complex.areas;
  const result: Transaction[] = [];
  const now = new Date(2026, 4, 1);
  for (let i = 0; i < 20; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 180));
    const area = areas[Math.floor(Math.random() * areas.length)];
    const areaNum = parseInt(area);
    const basePrice = areaNum * 580 + Math.floor(Math.random() * 3000);
    result.push({
      date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`,
      area,
      floor: Math.floor(Math.random() * 25) + 1,
      price: Math.round(basePrice / 100) * 100,
    });
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
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

const basePrices: Record<number, number> = {
  1: 75000, 2: 68000, 3: 95000,
  4: 72000, 5: 88000,
  6: 80000, 7: 65000, 8: 85000,
};

export const complexData: Complex[] = baseComplexes.map((c) => ({
  ...c,
  monthlyPrices: genPrices(basePrices[c.id] ?? 70000),
  transactions: genTransactions(c),
}));
