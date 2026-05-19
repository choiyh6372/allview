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
  monthlyPricesByArea: Record<string, MonthlyPrice[]>;
  transactions: Transaction[];
  vrInfo?: { regionId: string; slug: string; types: string[] };
}
