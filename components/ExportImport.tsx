"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportUserData, importUserData } from "@/actions/export-import";
import { DatabaseBackup, UploadCloud } from "lucide-react";

export default function ExportImport() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    try {
      setLoading(true);
      const data = await exportUserData();
      
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cashback_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Ошибка экспорта");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importText.trim()) return;

    if (!confirm("Внимание! Текущие данные будут стерты и заменены данными из резервной копии. Продолжить?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await importUserData(importText);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setImportText("");
        router.refresh();
      }
    } catch (err) {
      setError("Ошибка импорта");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
        title="Экспорт / Импорт"
      >
        <DatabaseBackup size={16} /> Настройки данных
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Экспорт и Импорт</h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-sm mb-2">Скачать резервную копию</h4>
                <p className="text-xs text-zinc-500 mb-3">Сохраните все ваши данные в формате JSON на случай переноса.</p>
                <button 
                  onClick={handleExport}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-2 text-sm"
                >
                  <DatabaseBackup size={16} /> Экспортировать в файл
                </button>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <h4 className="font-semibold text-sm mb-2">Восстановить из копии</h4>
                <p className="text-xs text-red-500 mb-3">Внимание: текущие данные будут удалены!</p>
                
                {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded mb-3">{error}</div>}
                
                <form onSubmit={handleImport} className="flex flex-col gap-3">
                  <textarea 
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder="Вставьте содержимое JSON-файла сюда..."
                    className="w-full h-32 p-3 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                      Закрыть
                    </button>
                    <button 
                      type="submit"
                      disabled={loading || !importText.trim()}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      <UploadCloud size={16} /> Восстановить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
