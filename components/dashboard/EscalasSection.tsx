'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EscalaCard, { EscalaCardProps } from '@/components/dashboard/escala-card';
import { EscalasGridSkeleton } from '@/components/dashboard/skeletons';
import { createClient } from '@/lib/supabase/client';
import type { EscalaMensal, Culto } from '@/lib/types/database';

const MESES_PT: Record<number, string> = {
  1: 'Janeiro',  2: 'Fevereiro', 3: 'Março',    4: 'Abril',
  5: 'Maio',     6: 'Junho',     7: 'Julho',    8: 'Agosto',
  9: 'Setembro', 10: 'Outubro',  11: 'Novembro', 12: 'Dezembro',
};

const DIAS_TRADUCAO: Record<string, string> = {
  'Sunday': 'Domingo', 'Monday': 'Segunda', 'Tuesday': 'Terça', 'Wednesday': 'Quarta',
  'Thursday': 'Quinta', 'Friday': 'Sexta', 'Saturday': 'Sábado',
  'Sun': 'Domingo', 'Mon': 'Segunda', 'Tue': 'Terça', 'Wed': 'Quarta',
  'Thu': 'Quinta', 'Fri': 'Sexta', 'Sat': 'Sábado'
};

/**
 * Transforma os dados da view vw_escalas_mensais para o formato dos EscalaCards.
 * A view já agrupa por escala (1 linha por departamento por data) — aqui
 * agrupamos por dia para exibir múltiplos departamentos em um mesmo card.
 */
function transformarParaCards(dados: EscalaMensal[], cultos: Culto[]): EscalaCardProps[] {
  // Agrupa por dia (pode haver múltiplos departamentos no mesmo dia)
  const porDia = new Map<string, EscalaMensal[]>();
  for (const linha of dados) {
    const key = linha.dia;
    if (!porDia.has(key)) porDia.set(key, []);
    porDia.get(key)!.push(linha);
  }

  return Array.from(porDia.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, linhas]) => {
      const primeira = linhas[0];
      
      const diaSemana = DIAS_TRADUCAO[primeira.dia_semana] || primeira.dia_semana;
      
      // Formata data: "Sábado, 16/05/2026"
      const dataFormatada = `${diaSemana}, ${primeira.dia_formatado}`;
      
      // Tenta encontrar o culto para o mesmo dia/hora ou usa o horário padrão
      // Como a view não tem culto_id, vamos tentar bater pela data_hora
      const cultoEncontrado = cultos.find(c => c.data === primeira.data_hora);
      const cultoNome = cultoEncontrado ? cultoEncontrado.nome : "Culto";

      // Extrai o horário
      const hora = primeira.data_hora.includes('T') 
        ? primeira.data_hora.split('T')[1].substring(0, 5) 
        : "";

      // Status do dia = o pior entre todos os departamentos
      const statusPrioridade = { critica: 0, alerta: 1, confirmada: 2 };
      const statusDia = linhas.reduce((pior, l) =>
        statusPrioridade[l.status] < statusPrioridade[pior] ? l.status : pior,
        'confirmada' as EscalaMensal['status']
      );

      return {
        data: dataFormatada,
        cultoInfo: `${cultoNome} • ${hora}`,
        status: statusDia,
        equipes: linhas.map((l) => ({
          id: l.escala_id,
          nome: l.departamento_nome,
          membros: l.voluntarios.map((v) => v.nome).join(', '),
          alerta: l.voluntarios.length === 0 ? 'Poucos voluntários escalados' : undefined,
        })),
      };
    });
}

export default function EscalasSection() {
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [escalas, setEscalas] = useState<EscalaCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarEscalas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano]);

  async function buscarEscalas() {
    setLoading(true);
    setErro(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('vw_escalas_mensais')
        .select('*')
        .eq('mes', mes)
        .eq('ano', ano)
        .order('data_hora', { ascending: true });

      if (error) throw error;

      // Busca os cultos para bater o nome
      const { data: cultosData } = await supabase
        .from('cultos')
        .select('*');

      setEscalas(transformarParaCards((data as EscalaMensal[]) ?? [], (cultosData as Culto[]) ?? []));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar escalas');
    } finally {
      setLoading(false);
    }
  }

  async function excluirEscala(id: number) {
    if (!confirm('Deseja realmente excluir esta escala?')) return;
    
    const supabase = createClient();
    const { error } = await supabase.from('escalas').delete().eq('id', id);
    
    if (error) {
      alert('Erro ao excluir escala');
    } else {
      buscarEscalas();
    }
  }

  function irMesAnterior() {
    if (mes === 1) { setMes(12); setAno((a) => a - 1); }
    else setMes((m) => m - 1);
  }

  function irProximoMes() {
    if (mes === 12) { setMes(1); setAno((a) => a + 1); }
    else setMes((m) => m + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header da seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">
          Escalas de {MESES_PT[mes]} {ano}
        </h2>

        {/* Navegação de mês */}
        <div className="flex items-center gap-2">
          <button
            onClick={irMesAnterior}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <select
              id="select-mes"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {Object.entries(MESES_PT).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              id="select-ano"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {[2024, 2025, 2026, 2027].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <button
            onClick={irProximoMes}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {loading && <EscalasGridSkeleton />}

      {!loading && erro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span>⚠️</span>
          <span>{erro}</span>
        </div>
      )}

      {!loading && !erro && escalas.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">📅</span>
          <p className="text-gray-500 font-medium">Nenhuma escala encontrada</p>
          <p className="text-gray-400 text-sm">
            Não há escalas para {MESES_PT[mes]} de {ano}.
          </p>
        </div>
      )}

      {!loading && !erro && escalas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {escalas.map((escala, index) => (
            <EscalaCard key={index} {...escala} onDelete={excluirEscala} />
          ))}
        </div>
      )}
    </div>
  );
}
