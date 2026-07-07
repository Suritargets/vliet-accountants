import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { destroySession, requireSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";

async function logout() {
  "use server";
  await destroySession();
  redirect("/admin/login");
}

export default async function AdminShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <p className="text-sm text-gray-500">
            Ingelogd als <span className="font-medium text-navy">{session.email}</span>
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Uitloggen
            </button>
          </form>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
