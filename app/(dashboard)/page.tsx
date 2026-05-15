/**
 * app/(dashboard)/page.tsx
 *
 * SERVER COMPONENT — busca as métricas do dashboard diretamente no Supabase
 * via a função RPC fn_dashboard_metricas (schema creative).
 */

import Statcard from '@/components/dashboard/status-card';
import EscalasSection from '@/components/dashboard/EscalasSection';
import { Calendar, Briefcase, Church, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { DashboardMetricas } from '@/lib/types/database';

async function buscarMetricas(): Promise<DashboardMetricas> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('fn_dashboard_metricas');

    if (error) throw error;

    return data as DashboardMetricas;
  } catch {
    return {
      total_schedules: 0,
      total_users: 0,
      total_departments: 0,
      total_cults: 0,
    };
  }
}

export default async function Home() {
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

      {/* Grid de Cards de Métricas */}
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
