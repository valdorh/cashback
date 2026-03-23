"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

export default function SummaryBlock({ banks }: { banks: any[] }) {
  const topCategories = useMemo(() => {
    if (!banks) return [];
    
    type CatInfo = { name: string, percent: number, bankName: string, cardName: string };
    const allCats: CatInfo[] = [];

    banks.forEach(bank => {
      bank.cards?.forEach((card: any) => {
        card.categories?.forEach((cat: any) => {
          allCats.push({
            name: cat.userCategory?.name || "Без названия",
            percent: cat.percent,
            bankName: bank.name,
            cardName: card.name
          });
        });
      });
    });

    // Sort by percent descending
    allCats.sort((a, b) => b.percent - a.percent);

    // Get top 5 unique by percent+name context or just top 5 absolute
    return allCats.slice(0, 5);
  }, [banks]);

  if (topCategories.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg mb-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4 opacity-90">
        <TrendingUp size={20} /> Топ кэшбэков месяца
      </h3>
      <div className="flex flex-wrap gap-3">
        {topCategories.map((cat, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex-1 min-w-[200px]">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold">{cat.name}</span>
              <span className="text-xl font-black text-green-300">{cat.percent}%</span>
            </div>
            <div className="text-xs text-blue-100 opacity-80">
              {cat.bankName} • {cat.cardName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
