"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CheckSquare, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar, Loading } from "./ui";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 text-lg font-bold ${light ? "text-white" : "text-slate-900"}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <CheckSquare size={18} />
      </span>
      TaskFlow
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Don't render private UI until we know the session is valid.
  if (status !== "authenticated" || !user) return <Loading text="Checking your session..." />;

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
              active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-8 p-4">
      <div className="px-2 pt-1"><Logo light /></div>
      {nav}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <LogOut size={18} /> Log out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-60 shrink-0 bg-slate-900 md:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-64 bg-slate-900">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="hidden text-sm text-slate-500 md:block">Workspace</span>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-slate-900">{user.full_name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <Avatar name={user.full_name} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
