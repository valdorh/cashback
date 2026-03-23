"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createMonthUnified, deleteMonth } from "@/actions/months";
import { Trash2 } from "lucide-react";

export default function MonthSelector({ months, currentMonthId }: { months: any[], currentMonthId: string | null }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const upcomingMonths = useMemo(() => {
    const ruMonths = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      options.push({
        value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`,
        label: `${ruMonths[d.getMonth()]} ${d.getFullYear()}`
      });
    }
    return options;
  }, []);

  const [selectedUpcomingValue, setSelectedUpcomingValue] = useState<string>(upcomingMonths[0].value);
  const [copyFromId, setCopyFromId] = useState<string>("none");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    
    const monthOption = upcomingMonths.find(m => m.value === selectedUpcomingValue);
    if (!monthOption) return;

    // Duplicate check
    const alreadyExists = months.some(m => m.label === monthOption.label);
    if (alreadyExists) {
      alert("Этот месяц уже добавлен в ваш список!");
      return;
    }

    const key = `${monthOption.value}-${Math.random().toString(36).substring(7)}`;
    const newMonthLabel = monthOption.label;

    const baseMonthId = months.length > 0 ? months[0].id : null;
    const categorySourceId = copyFromId !== "none" ? copyFromId : null;

    await createMonthUnified(key, newMonthLabel, baseMonthId, categorySourceId);
    
    setIsCreating(false);
    setSelectedUpcomingValue(upcomingMonths[0].value);
    router.refresh(); 
  }

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <select 
          className="p-2 md:px-4 md:py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          value={currentMonthId || ""}
          onChange={(e) => router.push(`/?month=${e.target.value}`)}
        >
          {months.length === 0 && <option value="" disabled>Нет месяцев</option>}
          {months.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        
        {currentMonthId && (
          <button 
            onClick={async () => {
              if (confirm("Вы точно хотите удалить этот месяц и все его данные?")) {
                await deleteMonth(currentMonthId);
                router.push("/");
                router.refresh();
              }
            }}
            className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Удалить месяц"
          >
            <Trash2 size={18} />
          </button>
        )}

        <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium text-sm rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          + Добавить
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 shadow-2xl rounded-2xl w-full max-w-sm border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4">Новый месяц</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Месяц добавления</label>
                <select 
                  value={selectedUpcomingValue}
                  onChange={e => setSelectedUpcomingValue(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {upcomingMonths.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              {months.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Скопировать из предыдущего</label>
                  <select 
                    value={copyFromId} 
                    onChange={e => setCopyFromId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none"
                  >
                    <option value="none">Не копировать (пустой)</option>
                    {months.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex gap-2 mt-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
