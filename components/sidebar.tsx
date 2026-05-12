"use client";

import { Camera, LayoutDashboard, PenTool, Power, Users, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/" },
    { name: "Equipe", icon: Users, href: "/equipe" },
    { name: "Gerador Inteligente", icon: Camera, href: "/gerador" },
    { name: "Relatórios", icon: PenTool, href: "/relatorios" },
    { name: "Criar Escala", icon: Power, href: "/escala" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 h-screen fixed left-0 top-0 bg-creative-dark border-r border-creative-border/10">
            {/* Area do Logo (Mais grudada no topo) */}
            <div className="w-full flex">
                <Image
                    src={"/logo.svg"}
                    alt="Logo do Creative"
                    width={150}
                    height={40}
                    className="drop-shadow-sm scale-[1.6] origin-left"
                    priority
                />
            </div>

            {/* Linha separadora */}
            <div className="w-full h-px bg-creative-border/10 mb-8 text-creative-sidebar-text"></div>

            {/* Menu de Links */}
            <div className="flex flex-col gap-6 px-8">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link href={item.href} key={item.name}>
                            <div className={`relative flex flex-row gap-4 items-center cursor-pointer transition-all hover:scale-105 origin-left ${isActive ? 'text-white' : 'text-creative-sidebar-text hover:text-creative-light'}`}>
                                {/* Quadradinho indicador de ativo */}
                                {isActive && (
                                    <div className="absolute -left-6 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
                                )}
                                <Icon size={22} />
                                <p className="font-medium text-sm tracking-wide">{item.name}</p>
                            </div>
                        </Link>
                    )
                })}
                
                {/* Perfil no final */}
                <Link href="/perfil" className="mt-8">
                    <div className={`relative flex flex-row gap-4 items-center cursor-pointer transition-all hover:scale-105 origin-left ${pathname === '/perfil' ? 'text-white' : 'text-creative-sidebar-text hover:text-creative-light'}`}>
                        {pathname === '/perfil' && (
                            <div className="absolute -left-6 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
                        )}
                        <Video size={22} />
                        <p className="font-medium text-sm tracking-wide">Perfil</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}