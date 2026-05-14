/**
 * app/(dashboard)/page.tsx
 *
 * SERVER COMPONENT — busca as métricas do dashboard no servidor,
 * sem useEffect, sem "use client". Isso elimina o tempo de espera
 * de hydration para dados que não mudam dinamicamente.
 *
 * O seletor de mês/escala fica no componente cliente EscalasSection.
 */

import Statcard from "@/components/dashboard/status-card";
import EscalasSection from "@/components/dashboard/EscalasSection";
import { Calendar, Briefcase, Church, Users } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

interface DashboardMetricas {
  total_schedules: number;
  total_users: number;
  total_departments: number;
  total_cults: number;
}

async function buscarMetricas(): Promise<DashboardMetricas> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/metricas`, {
      // Revalida o cache a cada 60 segundos (ISR)
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error("Falha ao buscar métricas");

    return response.json();
  } catch {
    // Retorna zeros em caso de erro para não quebrar a UI
    return {
      total_schedules: 0,
      total_users: 0,
      total_departments: 0,
      total_cults: 0,
    };
  }
}

export default async function Home() {
  // Fetch acontece no servidor — zero useEffect, zero loading state para métricas
  const metricas = await buscarMetricas();

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          ESCALAS DA IGREJA
        </h1>
        <p className="text-gray-500">Gerencie as escalas de voluntários</p>
      </div>

      {/* Grid de Cards de Métricas (renderizado no servidor) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Statcard
          titulo="Total de Escalas"
          valor={metricas.total_schedules}
          icone={<Calendar size={28} strokeWidth={1.5} />}
          href="/escalas"
        />
        <Statcard
          titulo="Voluntários Ativos"
          valor={metricas.total_users}
          icone={<Users size={28} strokeWidth={1.5} />}
          href="/voluntarios"
        />
        <Statcard
          titulo="Departamentos"
          valor={metricas.total_departments}
          icone={<Briefcase size={28} strokeWidth={1.5} />}
          href="/departamentos"
        />
        <Statcard
          titulo="Total de Cultos"
          valor={metricas.total_cults}
          icone={<Church size={28} strokeWidth={1.5} />}
          href="/alertas"
        />
      </div>

      {/* Seção de Escalas do Mês (Client Component — mantém estado interativo) */}
      <EscalasSection />
    </div>
  );
}
