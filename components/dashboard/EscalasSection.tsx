"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EscalaCard, { EscalaCardProps } from "@/components/dashboard/escala-card";
import { EscalasGridSkeleton } from "@/components/dashboard/skeletons";
import { API_BASE_URL } from "@/lib/constants";

// --- Tipos espelhando a resposta da API ---
interface MembroEquipe {
  id: number;
  nome: string;
}

interface DepartamentoEscala {
  id: number;
  nome: string;
  equipe: MembroEquipe[];
  alerta: string | null;
}

interface DiaEscala {
  dia: string;
  dia_formatado: string;
  dia_semana: string;
  status: "confirmada" | "alerta" | "critica";
  departamentos: DepartamentoEscala[];
}

const MESES_PT: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
  5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
  9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

function transformarParaCards(dados: DiaEscala[]): EscalaCardProps[] {
  return dados.map((dia) => ({
    data: dia.dia_formatado,
    diaHora: dia.dia_semana,
    status: dia.status,
    equipes: dia.departamentos.map((dept) => ({
      nome: dept.nome,
      membros: dept.equipe.map((m) => m.nome).join(", "),
      alerta: dept.alerta ?? undefined,
    })),
  }));
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
  }, [mes, ano]);

  async function buscarEscalas() {
    setLoading(true);
    setErro(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/schedules/monthly?mes=${mes}&ano=${ano}`
      );
      if (!response.ok) throw new Error("Erro ao buscar escalas");
      const data: DiaEscala[] = await response.json();
      setEscalas(transformarParaCards(data));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {escalas.map((escala, index) => (
            <EscalaCard key={index} {...escala} />
          ))}
        </div>
      )}
    </div>
  );
}
