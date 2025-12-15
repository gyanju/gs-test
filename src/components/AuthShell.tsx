"use client";

import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1650&q=80')",
      }}
    >
      {/* Gradient + dark overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-black/60 backdrop-blur-sm" />

      {/* Top-left brand */}
      <div className="pointer-events-none absolute left-6 top-6 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
        <span className="pointer-events-auto rounded-full bg-white/10 px-4 py-1">
          MountainLake App
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mb-6 text-sm text-gray-600">{subtitle}</p>
        )}

        {children}
      </div>
    </div>
  );
}
