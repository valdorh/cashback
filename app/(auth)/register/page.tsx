"use client";

import { useState } from "react";
import { register } from "@/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await register(formData);
    
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Создать аккаунт</h1>
        
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
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Зарегистрироваться
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-zinc-500">
          Уже есть аккаунт? <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
        </p>
      </div>
    </main>
  );
}
