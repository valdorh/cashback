"use client";

import { useState } from "react";
import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await login(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // No else block needed as successful login redirects via NextAuth
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
        
        {error && <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-zinc-500">
          Нет аккаунта? <Link href="/register" className="text-blue-600 hover:underline">Создать</Link>
        </p>
      </div>
    </main>
  );
}
