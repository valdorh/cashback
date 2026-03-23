"use client";

import { useState, useMemo } from "react";
import MonthSelector from "./MonthSelector";
import BankList from "./BankList";
import SummaryBlock from "./SummaryBlock";
import CategorySearchBlock from "./CategorySearchBlock";
import { Search } from "lucide-react";

export default function DashboardClient({ 
  months, 
  initialMonthData, 
  selectedMonthId,
  userCategories = []
}: { 
  months: any[], 
  initialMonthData: any, 
  selectedMonthId: string | null,
  userCategories?: any[]
}) {
  const monthData = initialMonthData;
  const [searchQuery, setSearchQuery] = useState("");

  const [isSeeding, setIsSeeding] = useState(false);

  async function handleSeed() {
    setIsSeeding(true);
    try {
      const { seedDemoData } = await import("@/actions/seed");
      await seedDemoData();
      window.location.reload();
    } catch (e) {
      alert("Ошибка при добавлении демо-данных");
      setIsSeeding(false);
    }
  }

  // If no months exist, show empty state
  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-[2.5rem] bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-950/50 border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
        </div>
        
        <h2 className="text-3xl font-black mb-4 tracking-tight">Добро пожаловать в Cashback Tracker!</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-lg text-lg leading-relaxed">Вам нужно добавить месяц, чтобы начать отслеживать категории кэшбэка по картам. Вы можете создать пустой месяц или загрузить пример.</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10">
          <MonthSelector months={[]} currentMonthId={null} />
          
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSeeding ? "Загружаем..." : "Загрузить демо-данные"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{monthData?.label || "Загрузка..."}</h2>
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text"
              placeholder="Поиск по банкам, картам, категориям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <MonthSelector months={months} currentMonthId={selectedMonthId} />
        </div>
      </div>

      <div className="space-y-4">
        {monthData && <CategorySearchBlock banks={monthData.banks} userCategories={userCategories} />}
        {monthData && <SummaryBlock banks={monthData.banks} />}
      </div>

      {monthData && <BankList monthId={monthData.id} initialBanks={monthData.banks} searchQuery={searchQuery} userCategories={userCategories} />}
    </div>
  );
}
