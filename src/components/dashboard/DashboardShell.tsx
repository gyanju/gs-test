"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoutButton } from "../LogoutButton";

type DashboardShellProps = {
  children: ReactNode;
};

type MeResponse = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/activity", label: "Activity" },
  ];

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const data = await res.json();
        setMe(data);
      } catch (err) {
        console.error("Error loading /api/me:", err);
      }
    }
    loadMe();
  }, []);

  /*async function handleLogout() {
    setLogoutLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLogoutLoading(false);
    }
  }*/

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 shadow-xl">
        {/* Brand */}
        <div className="px-5 pb-4 pt-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Admin
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-500/80 shadow-md" />
            <div>
              <div className="text-sm font-semibold text-slate-50">
                Control Panel
              </div>
              <div className="text-xs text-slate-400">
                Your app overview
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-2 flex-1 space-y-1 px-3 pb-4">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600/80 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                {/* Active indicator bar on the left */}
                <span
                  className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-blue-400 transition ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  }`}
                />
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom small text if you want */}
        <div className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
          <div>Logged in as</div>
          <div className="truncate font-medium text-slate-200">
            {me
              ? `${me.firstName} ${me.lastName}`
              : "User"}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3 backdrop-blur">
          <div className="text-sm text-slate-200">
            {me ? (
              <span>
                Welcome,{" "}
                <span className="font-semibold">
                  {me.firstName} {me.lastName}
                </span>
              </span>
            ) : (
              <span className="text-slate-400">Welcome</span>
            )}
          </div>
          <LogoutButton />          
        </header>

        {/* Content */}
        <main className="flex-1 bg-slate-950/95 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
