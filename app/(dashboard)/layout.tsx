import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ExportImport from "@/components/ExportImport";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      <header className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Кэшбэк Трекер</h1>
        
        <div className="flex items-center gap-6">
          <ExportImport />
          
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut({redirectTo: "/login"});
          }}>
            <button type="submit" className="text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              Выйти
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
