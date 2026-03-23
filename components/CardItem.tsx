"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCard } from "@/actions/cards";
import { deleteCategory, createCategory } from "@/actions/categories";
import { Plus, Trash2, Tag, Percent } from "lucide-react";

const COLORS = [
  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
];

function getColorForString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function CardItem({ card, bankId, userCategories = [] }: { card: any, bankId: string, userCategories?: any[] }) {
  const router = useRouter();
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [catName, setCatName] = useState("");
  const [catPercent, setCatPercent] = useState("");

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName || !catPercent) return;
    
    await createCategory(card.id, catName, parseFloat(catPercent));
    setIsAddingCat(false);
    setCatName("");
    setCatPercent("");
    router.refresh();
  }

  async function handleDelCard() {
    if (confirm(`Удалить карту "${card.name}"?`)) {
      await deleteCard(card.id);
      router.refresh();
    }
  }

  async function handleDelCat(catId: string) {
    await deleteCategory(catId);
    router.refresh();
  }

  return (
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 relative group">
      <div className="px-4 py-3 bg-zinc-100/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <h4 className="font-semibold text-sm">{card.name}</h4>
        <button onClick={handleDelCard} className="text-zinc-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        {card.categories?.length === 0 && !isAddingCat && (
          <div className="text-xs text-zinc-400 text-center py-4">Нет кэшбэка</div>
        )}

        {card.categories?.map((cat: any) => (
          <div key={cat.id} className="flex items-center justify-between text-sm group/cat cursor-default">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getColorForString(cat.userCategory?.name || "Без названия")}`}>
              {cat.userCategory?.name || "Без названия"}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{cat.percent}%</span>
              <button 
                onClick={() => handleDelCat(cat.id)}
                className="text-zinc-300 hover:text-red-500 opacity-0 group-hover/cat:opacity-100"
              >
                &times;
              </button>
            </div>
          </div>
        ))}

        {isAddingCat ? (
          <form onSubmit={handleAddCategory} className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <input 
              autoFocus
              list={`cats-${card.id}`}
              value={catName} 
              onChange={e => setCatName(e.target.value)} 
              placeholder="Категория (напр. Супермаркеты)" 
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-blue-500 outline-none" 
            />
            <datalist id={`cats-${card.id}`}>
              {userCategories?.map((c: any) => <option key={c.id} value={c.name} />)}
            </datalist>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  step="0.1"
                  value={catPercent} 
                  onChange={e => setCatPercent(e.target.value)} 
                  placeholder="Процент" 
                  className="w-full text-xs p-2 pr-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-blue-500 outline-none" 
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
              </div>
              <button type="submit" className="px-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 w-full sm:w-auto">ОК</button>
              <button type="button" onClick={() => setIsAddingCat(false)} className="px-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg">&times;</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAddingCat(true)}
            className="mt-2 flex items-center justify-center gap-1 text-xs text-zinc-500 hover:text-blue-600 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 hover:border-blue-300 transition-colors shadow-sm"
          >
            <Plus size={14} /> Добавить
          </button>
        )}
      </div>
    </div>
  );
}
