'use client';

import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Departamento } from '@/lib/types/database';

const MESES_PT: Record<number, string> = {
  1: 'janeiro',  2: 'fevereiro', 3: 'março',    4: 'abril',
  5: 'maio',     6: 'junho',     7: 'julho',    8: 'agosto',
  9: 'setembro', 10: 'outubro',  11: 'novembro', 12: 'dezembro',
};

/**
 * GeradorForm — componente pesado carregado via next/dynamic
 * na rota /gerador. Gera escalas automaticamente para os domingos do mês,
 * inserindo diretamente nas tabelas do Supabase.
 */
export default function GeradorForm() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(false);

  const agora = new Date();
  const [mes, setMes] = useState(
    `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
  );
  const [departamentoId, setDepartamentoId] = useState<number | ''>('');
  const [quantidade, setQuantidade] = useState(4);
  const [resultado, setResultado] = useState<string | null>(null);

  useEffect(() => {
    buscarDepartamentos();
  }, []);

  async function buscarDepartamentos() {
    const supabase = createClient();
    const { data } = await supabase
      .from('departamentos')
      .select('*')
      .order('nome');
    if (data) setDepartamentos(data as Departamento[]);
  }

  async function gerarEscalas() {
    if (departamentoId === '') {
      alert('Selecione um departamento');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const [anoStr, mesStr] = mes.split('-');
      const anoNum = parseInt(anoStr);
      const mesNum = parseInt(mesStr);

      // Coleta os domingos do mês até atingir a quantidade desejada
      const domingosDates: string[] = [];
      const d = new Date(anoNum, mesNum - 1, 1);
      while (d.getMonth() === mesNum - 1 && domingosDates.length < quantidade) {
        if (d.getDay() === 0) {
          // Data/hora às 9h da manhã
          const iso = new Date(anoNum, mesNum - 1, d.getDate(), 9, 0, 0).toISOString();
          domingosDates.push(iso);
        }
        d.setDate(d.getDate() + 1);
      }

      if (domingosDates.length === 0) {
        setResultado('❌ Nenhum domingo encontrado para o mês selecionado.');
        return;
      }

      const supabase = createClient();

      // Insere cada domingo como uma escala
      const escalasParaInserir = domingosDates.map((data_hora) => ({
        data_hora,
        departamento_id: departamentoId as number,
        culto_id: null,
        observacoes: `Gerado automaticamente para ${MESES_PT[mesNum]} de ${anoNum}`,
      }));

      const { data: inseridas, error } = await supabase
        .from('escalas')
        .insert(escalasParaInserir)
        .select('id');

      if (error) throw error;

      setResultado(
        `✅ ${inseridas?.length ?? 0} escala(s) gerada(s) com sucesso para ${MESES_PT[mesNum]} de ${anoNum}! Agora adicione os voluntários em cada escala.`
      );
    } catch (error) {
      console.error(error);
      setResultado('❌ Erro ao gerar escalas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Mês */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Mês</label>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 w-full"
        />
      </div>

      {/* Departamento */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Departamento</label>
        <select
          value={departamentoId}
          onChange={(e) => setDepartamentoId(Number(e.target.value) || '')}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 w-full"
        >
          <option value="">Selecione...</option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </select>
      </div>

      {/* Quantidade */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Quantidade de Escalas (Domingos)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 w-full"
        />
      </div>

      {/* Botão */}
      <button
        onClick={gerarEscalas}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-1"
      >
        <Zap size={16} />
        {loading ? 'Gerando escalas...' : 'Gerar Escalas'}
      </button>

      {/* Resultado */}
      {resultado && (
        <div
          className={`text-sm rounded-xl p-4 border ${
            resultado.startsWith('✅')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {resultado}
        </div>
      )}
    </div>
  );
}

export function GeradorFormSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
          <div className="h-11 bg-gray-100 rounded-xl" />
        </div>
      ))}
      <div className="h-12 bg-gray-200 rounded-xl mt-1" />
    </div>
  );
}
