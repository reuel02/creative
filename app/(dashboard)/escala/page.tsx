'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Departamento, Voluntario } from '@/lib/types/database';

export default function NovaEscalaPage() {
  const router = useRouter();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [departamentoId, setDepartamentoId] = useState<number | ''>('');
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    buscarDepartamentos();
  }, []);

  useEffect(() => {
    if (departamentoId !== '') {
      buscarVoluntarios(departamentoId as number);
    } else {
      setVoluntarios([]);
    }
    setSelecionados([]);
  }, [departamentoId]);

  async function buscarDepartamentos() {
    const supabase = createClient();
    const { data } = await supabase
      .from('departamentos')
      .select('*')
      .order('nome');
    if (data) setDepartamentos(data as Departamento[]);
  }

  async function buscarVoluntarios(deptId: number) {
    const supabase = createClient();
    const { data } = await supabase
      .from('voluntarios')
      .select('*')
      .eq('departamento_id', deptId)
      .eq('ativo', true)
      .order('nome');
    if (data) setVoluntarios(data as Voluntario[]);
  }

  function toggleVoluntario(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  async function salvarEscala() {
    if (!data || !horario || departamentoId === '' || selecionados.length === 0) {
      alert('Preencha todos os campos obrigatórios e selecione ao menos 1 voluntário.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const dataHora = `${data}T${horario}:00`;

      // 1. Cria a escala
      const { data: novaEscala, error: erroEscala } = await supabase
        .from('escalas')
        .insert({
          data_hora: dataHora,
          departamento_id: departamentoId as number,
          culto_id: null,
          observacoes: observacoes || null,
        })
        .select('id')
        .single();

      if (erroEscala || !novaEscala) throw erroEscala ?? new Error('Falha ao criar escala');

      // 2. Vincula os voluntários selecionados
      const vinculos = selecionados.map((voluntario_id) => ({
        escala_id: novaEscala.id,
        voluntario_id,
      }));

      const { error: erroVinculos } = await supabase
        .from('escala_voluntarios')
        .insert(vinculos);

      if (erroVinculos) throw erroVinculos;

      alert('Escala criada com sucesso!');
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar escala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Criar Nova Escala
        </h1>
        <p className="text-gray-500">Preencha os detalhes da nova escala</p>
      </div>

      {/* Formulário */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-5 max-w-lg">
        {/* Data */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Horário */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Horário</label>
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Departamento */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Departamento
          </label>
          <select
            value={departamentoId}
            onChange={(e) => setDepartamentoId(Number(e.target.value) || '')}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="">Selecione...</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
        </div>

        {/* Voluntários (checkboxes) */}
        {voluntarios.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Voluntários
            </label>
            <div className="flex flex-col gap-0">
              {voluntarios.map((vol) => (
                <label
                  key={vol.id}
                  className="flex items-center gap-3 py-2.5 px-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.includes(vol.id)}
                    onChange={() => toggleVoluntario(vol.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                  />
                  <span className="text-sm text-gray-900">{vol.nome}</span>
                  {vol.cargo && vol.cargo !== 'Voluntário' && (
                    <span className="text-xs text-gray-400 ml-auto">{vol.cargo}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando departamento selecionado mas sem voluntários */}
        {departamentoId !== '' && voluntarios.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Nenhum voluntário ativo neste departamento.
          </p>
        )}

        {/* Observações */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione observações..."
            rows={3}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={salvarEscala}
            disabled={loading}
            className="flex-1 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Escala'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
