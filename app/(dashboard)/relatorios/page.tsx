"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";



interface Metrics {
  participacao_media: number;
  faltas_no_mes: number;
  escalas_concluidas: number;
  total_escalas: number;
}

interface VoluntarioRanking {
  id: number;
  nome: string;
  total_escalas: number;
}

export default function RelatoriosPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [ranking, setRanking] = useState<VoluntarioRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([buscarMetrics(), buscarRanking()]).finally(() =>
      setLoading(false)
    );
  }, []);

  async function buscarMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/metrics`);
      if (!response.ok) throw new Error("Erro ao buscar métricas");
      const data: Metrics = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarRanking() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/ranking`);
      if (!response.ok) throw new Error("Erro ao buscar ranking");
      const data: VoluntarioRanking[] = await response.json();
      setRanking(data);
    } catch (error) {
      console.error(error);
    }
  }

  // Maior valor do ranking para calcular porcentagem das barras
  const maxEscalas = ranking.length > 0 ? ranking[0].total_escalas : 1;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Relatórios de Serviço
        </h1>
        <p className="text-gray-500">Estatísticas e análises de participação</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando relatórios...</p>}

      {/* Cards de Métricas */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Participação Média */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Participação Média</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.participacao_media}%
            </p>
            <p className="text-xs text-green-600">↑ 5% vs mês anterior</p>
          </div>

          {/* Faltas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Faltas</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.faltas_no_mes}
            </p>
            <p className="text-xs text-gray-400">Neste mês</p>
          </div>

          {/* Escalas Concluídas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Escalas Concluídas</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.escalas_concluidas}
            </p>
            <p className="text-xs text-gray-400">
              De {metrics.total_escalas} escalas
            </p>
          </div>
        </div>
      )}

      {/* Ranking — Top Voluntários */}
      {ranking.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-gray-900">Top Voluntários</h2>

          <div className="flex flex-col gap-4">
            {ranking.map((vol) => {
              const porcentagem = (vol.total_escalas / maxEscalas) * 100;
              return (
                <div key={vol.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {vol.nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {vol.total_escalas} escalas
                    </p>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-500"
                      style={{ width: `${porcentagem}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
