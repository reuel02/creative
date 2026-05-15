'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Voluntario } from '@/lib/types/database';

interface VoluntarioRanking {
  id: number;
  nome: string;
  total_escalas: number;
}

export default function RelatoriosPage() {
  const [ranking, setRanking] = useState<VoluntarioRanking[]>([]);
  const [totalEscalas, setTotalEscalas] = useState(0);
  const [totalVoluntarios, setTotalVoluntarios] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    const supabase = createClient();

    // Conta total de escalas
    const { count: countEscalas } = await supabase
      .from('escalas')
      .select('*', { count: 'exact', head: true });

    // Conta voluntários ativos
    const { count: countVols } = await supabase
      .from('voluntarios')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Ranking de voluntários por número de escalas
    const { data: escalaVols } = await supabase
      .from('escala_voluntarios')
      .select('voluntario_id, voluntarios(id, nome)');

    // Agrupa contagem por voluntário
    const contagem: Record<number, { nome: string; total: number }> = {};
    for (const ev of escalaVols ?? []) {
      const vol = ev.voluntarios as unknown as Voluntario | null;
      if (!vol) continue;
      if (!contagem[vol.id]) contagem[vol.id] = { nome: vol.nome, total: 0 };
      contagem[vol.id].total += 1;
    }

    const rankingOrdenado = Object.entries(contagem)
      .map(([id, { nome, total }]) => ({
        id: Number(id),
        nome,
        total_escalas: total,
      }))
      .sort((a, b) => b.total_escalas - a.total_escalas)
      .slice(0, 10);

    setTotalEscalas(countEscalas ?? 0);
    setTotalVoluntarios(countVols ?? 0);
    setRanking(rankingOrdenado);
    setLoading(false);
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
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Total de Escalas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Total de Escalas</p>
            <p className="text-3xl font-bold text-gray-900">{totalEscalas}</p>
            <p className="text-xs text-gray-400">Todas as escalas criadas</p>
          </div>

          {/* Voluntários Ativos */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Voluntários Ativos</p>
            <p className="text-3xl font-bold text-gray-900">{totalVoluntarios}</p>
            <p className="text-xs text-gray-400">Cadastrados no sistema</p>
          </div>
        </div>
      )}

      {/* Ranking — Top Voluntários */}
      {!loading && ranking.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-gray-900">Top Voluntários por Escalas</h2>

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
                      {vol.total_escalas} {vol.total_escalas === 1 ? 'escala' : 'escalas'}
                    </p>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-500"
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && ranking.length === 0 && (
        <p className="text-sm text-gray-400">
          Nenhum dado de escala disponível ainda.
        </p>
      )}
    </div>
  );
}
