"use client";

import {
  LayoutDashboard,
  Users,
  Zap,
  ClipboardList,
  PlusCircle,
  Church,
  UserCircle,
  X,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { name: "Visão Geral", icon: LayoutDashboard, href: "/" },
  { name: "Equipe", icon: Users, href: "/equipe" },
  { name: "Gerador Inteligente", icon: Zap, href: "/gerador" },
  { name: "Relatórios", icon: ClipboardList, href: "/relatorios" },
  { name: "Nova Escala", icon: PlusCircle, href: "/escala" },
  { name: "Cultos", icon: Church, href: "/cultos" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Overlay (mobile only) ── */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
          md:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Sidebar Panel ── */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex flex-col w-64 h-screen
          bg-creative-dark border-r border-creative-border/10
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        aria-label="Menu de navegação"
      >
        {/* ── Header: Logo + Fechar (mobile) ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <Image
            src="/logo.svg"
            alt="Logo do Creative"
            width={150}
            height={40}
            style={{ height: "auto" }}
            className="drop-shadow-sm scale-[1.6] origin-left"
            priority
          />
          {/* Botão fechar — apenas mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-creative-sidebar-text hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Linha separadora */}
        <div className="w-full h-px bg-creative-border/10 mt-4 mb-8" />

        {/* ── Menu de Links ── */}
        <nav className="flex flex-col gap-1 px-4 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.name}
                onClick={onClose}
                className={`
                  relative flex flex-row gap-4 items-center px-4 py-3 rounded-xl
                  cursor-pointer transition-all duration-200
                  ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-creative-sidebar-text hover:text-creative-light hover:bg-white/5"
                  }
                `}
              >
                {/* Indicador de rota ativa */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                )}
                <Icon size={20} />
                <span className="font-medium text-sm tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer: Perfil + Logout ── */}
        <div className="px-4 pb-6 flex flex-col gap-1">
          <div className="w-full h-px bg-creative-border/10 mb-4" />

          <Link
            href="/perfil"
            onClick={onClose}
            className={`
              relative flex flex-row gap-4 items-center px-4 py-3 rounded-xl
              cursor-pointer transition-all duration-200
              ${
                pathname === "/perfil"
                  ? "bg-white/10 text-white"
                  : "text-creative-sidebar-text hover:text-creative-light hover:bg-white/5"
              }
            `}
          >
            {pathname === "/perfil" && (
              <div className="absolute left-0 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}
            <UserCircle size={20} />
            <span className="font-medium text-sm tracking-wide">
              Meu Perfil
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-row gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-creative-sidebar-text hover:text-red-400 hover:bg-red-500/10 w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm tracking-wide">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}