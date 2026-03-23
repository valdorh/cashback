"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBank, deleteBank } from "@/actions/banks";
import CardItem from "./CardItem";
import { Plus, Trash2 } from "lucide-react";

export default function BankList({ monthId, initialBanks, searchQuery = "", userCategories = [] }: { monthId: string, initialBanks: any[], searchQuery?: string, userCategories?: any[] }) {
  const router = useRouter();
  const banks = initialBanks || [];
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankName, setNewBankName] = useState("");

  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    if (!newBankName.trim()) return;
    
    // Optimistic UI could go here, but doing basic refresh
    await createBank(monthId, newBankName);
    setIsAddingBank(false);
    setNewBankName("");
    router.refresh();
  }

  async function handleDeleteBank(id: string) {
    if (confirm("Точно удалить этот банк и все его карты/категории?")) {
      await deleteBank(id);
      router.refresh();
    }
  }

  const [addingCardForBank, setAddingCardForBank] = useState<string | null>(null);
  const [newCardName, setNewCardName] = useState("");

  const query = searchQuery.toLowerCase().trim();

  // Filter logic
  const filteredBanks = banks.map(bank => {
    // 1. If bank matches, return everything inside it
    if (query && bank.name.toLowerCase().includes(query)) {
      return bank;
    }
    
    // 2. Otherwise filter cards
    if (query) {
      const filteredCards = bank.cards?.filter((card: any) => {
        if (card.name.toLowerCase().includes(query)) return true;
        
        // 3. Or if any category matches
        const hasMatchingCat = card.categories?.some((cat: any) => 
          (cat.userCategory?.name || "").toLowerCase().includes(query)
        );
        return hasMatchingCat;
      });
      return { ...bank, cards: filteredCards };
    }
    
    return bank;
  }).filter(bank => !query || bank.name.toLowerCase().includes(query) || (bank.cards && bank.cards.length > 0));

  async function handleAddCard(e: React.FormEvent, bankId: string) {
    e.preventDefault();
    if (!newCardName.trim()) return;
    
    const { createCard } = await import("@/actions/cards");
    await createCard(bankId, newCardName);
    setAddingCardForBank(null);
    setNewCardName("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {filteredBanks.map(bank => (
        <div key={bank.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm relative group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-sm font-black">
                {bank.name.charAt(0).toUpperCase()}
              </div>
              {bank.name}
            </h3>
            <button 
              onClick={() => handleDeleteBank(bank.id)}
              className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
              title="Удалить банк"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bank.cards?.map((card: any) => (
              <CardItem key={card.id} card={card} bankId={bank.id} userCategories={userCategories} />
            ))}
            
            {addingCardForBank === bank.id ? (
              <form onSubmit={(e) => handleAddCard(e, bank.id)} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-center h-full min-h-[160px] bg-zinc-50 dark:bg-zinc-900/50">
                <input 
                  autoFocus
                  required
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  placeholder="Название (напр. Tinkoff Black)"
                  className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAddingCardForBank(null)} className="flex-1 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">Отмена</button>
                  <button type="submit" className="flex-1 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">Сохранить</button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setAddingCardForBank(bank.id)}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center py-8 text-zinc-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 dark:hover:border-blue-900 transition-colors h-full min-h-[160px]"
              >
                <Plus size={24} className="mb-2" />
                <span className="font-medium text-sm">Добавить карту</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {isAddingBank ? (
        <form onSubmit={handleAddBank} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <input 
            autoFocus
            value={newBankName}
            onChange={e => setNewBankName(e.target.value)}
            placeholder="Название банка (напр. Сбер, Тинькофф, Альфа)"
            className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="button" onClick={() => setIsAddingBank(false)} className="px-4 py-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium">
            Отмена
          </button>
          <button type="submit" className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-md">
            Сохранить
          </button>
        </form>
      ) : (
        <button 
          onClick={() => setIsAddingBank(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Добавить банк
        </button>
      )}
    </div>
  );
}
