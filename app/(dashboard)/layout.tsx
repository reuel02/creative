"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar (desktop: sempre visível | mobile: drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área principal — margem só no desktop para dar espaço ao sidebar fixo */}
      <div className="flex flex-col flex-1 md:ml-64 min-h-screen">
        {/* ── Top Bar Mobile (hambúrguer) ── */}
        <header className="flex md:hidden items-center gap-4 px-4 py-3 bg-creative-dark border-b border-white/10 sticky top-0 z-30">
          <button
            id="menu-hamburguer"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold text-sm tracking-wide">
            Sistema Creative
          </span>
        </header>

        {/* ── Conteúdo da Página ── */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-white">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
