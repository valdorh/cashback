"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function CategorySearchBlock({ banks, userCategories }: { banks: any[], userCategories: any[] }) {
  const [selectedCatName, setSelectedCatName] = useState("");

  const hits: any[] = [];
  if (selectedCatName) {
    banks.forEach(bank => {
      bank.cards?.forEach((card: any) => {
        card.categories?.forEach((cat: any) => {
          const catName = cat.userCategory?.name || "Без названия";
          if (catName === selectedCatName) {
            hits.push({
              bankName: bank.name,
              cardName: card.name,
              percent: cat.percent,
              id: cat.id
            });
          }
        });
      });
    });
  }

  // sort by percent desc
  hits.sort((a, b) => b.percent - a.percent);

  return (
    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
           <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
             <Search size={20} /> 
           </div>
           Искать кэшбэк
        </h3>
        <select 
          value={selectedCatName}
          onChange={e => setSelectedCatName(e.target.value)}
          className="w-full md:w-72 p-3 font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
        >
          <option value="">Выберите категорию...</option>
          {userCategories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCatName && hits.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {hits.map(hit => (
             <div key={hit.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
               <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">{hit.bankName}</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{hit.cardName}</div>
               </div>
               <div className="text-lg font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl group-hover:scale-110 transition-transform">
                 {hit.percent}%
               </div>
             </div>
           ))}
         </div>
      )}
      
      {selectedCatName && hits.length === 0 && (
        <div className="text-center py-8 text-zinc-500 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          В этом месяце кэшбэк на <b>"{selectedCatName}"</b> не найден 😔
        </div>
      )}
    </div>
  );
}
