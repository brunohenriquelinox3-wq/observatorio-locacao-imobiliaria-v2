import type { ChartConfig } from "@/components/ui/chart";

export type MarketCity = {
  cidade: string;
  alta: number;
  preco: number;
  yield: number;
};

export const marketTrend = [
  { periodo: "2022", valor: 16.55 }, { periodo: "2023", valor: 16.16 },
  { periodo: "2024", valor: 13.5 }, { periodo: "2025", valor: 9.44 }, { periodo: "Jul/26*", valor: 9.28 },
];

export const rentedHouseholds = [{ ano: "2016", valor: 12.2 }, { ano: "2025", valor: 18.9 }];

export const marketCities: MarketCity[] = [
  { cidade: "Aracaju", alta: 25.78, preco: 36.9, yield: 6.67 },
  { cidade: "Teresina", alta: 19.16, preco: 32.45, yield: 6.32 },
  { cidade: "Fortaleza", alta: 14.8, preco: 41.66, yield: 4.94 },
  { cidade: "Brasília", alta: 14.8, preco: 54.56, yield: 6.45 },
  { cidade: "Natal", alta: 14.6, preco: 44.26, yield: 7.85 },
  { cidade: "Rio de Janeiro", alta: 13.52, preco: 60.8, yield: 6.29 },
];

export const marketChartConfigs = {
  trend: { valor: { label: "Variação em 12 meses", color: "#C65A35" } },
  rentals: { valor: { label: "Domicílios alugados", color: "#173B4D" } },
  cities: { alta: { label: "Variação em 12 meses", color: "#C65A35" } },
} satisfies Record<string, ChartConfig>;

export function resolveMarketCity(cityName: string): MarketCity {
  return marketCities.find((city) => city.cidade === cityName) ?? marketCities[0];
}
