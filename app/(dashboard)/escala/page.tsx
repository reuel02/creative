'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Church, ChevronDown, AlertCircle, Info, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Culto, Departamento, Voluntario } from '@/lib/types/database';

/** Limites de voluntários por departamento */
const LIMITES_DEPARTAMENTO: Record<string, number> = {
  'Corte': 2,
  'Datashow': 1,
  'Iluminação': 2,
  'Stories': 2,
  'Foto': 2,
};

/** Lê hora da string ISO sem converter timezone */
function extrairHora(iso: string): string {
  const semOffset = iso.replace(/([+-]\d{2}:?\d{2}|Z)$/, '');
  const timePart = semOffset.includes('T') ? semOffset.split('T')[1] : semOffset.split(' ')[1];
  return (timePart ?? '').substring(0, 5);
}

/** Lê data YYYY-MM-DD da string ISO sem converter timezone */
function extrairData(iso: string): string {
  return iso.includes('T') ? iso.split('T')[0] : iso.split(' ')[0];
}

/** Formata data para exibição DD/MM */
function formatarDiaMes(iso: string): string {
  const date = extrairData(iso);
  const [, mes, dia] = date.split('-');
  return `${dia}/${mes}`;
}

/** Formata culto para exibição no select */
function formatarCulto(culto: Culto): string {
  const [ano, mes, dia] = extrairData(culto.data).split('-');
  const hora = extrairHora(culto.data);
  return `${culto.nome} — ${dia}/${mes}/${ano} às ${hora}`;
}

function EscalaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  // Dados do banco
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);

  // Form state
  const [cultoId, setCultoId] = useState<number | ''>('');
  const [departamentoId, setDepartamentoId] = useState<number | ''>('');
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);

  // Regras de Negócio
  const [conflitos, setConflitos] = useState<Record<number, string>>({}); // id -> data do conflito

  useEffect(() => {
    async function init() {
      await Promise.all([buscarCultos(), buscarDepartamentos()]);
      if (editId) {
        await carregarEscala(Number(editId));
      }
    }
    init();
  }, [editId]);

  useEffect(() => {
    if (departamentoId !== '' && !initialLoading) {
      buscarVoluntarios(departamentoId as number);
      setSelecionados([]);
    }
  }, [departamentoId]);

  useEffect(() => {
    if (cultoId !== '') {
      buscarConflitos(Number(cultoId));
    } else {
      setConflitos({});
    }
  }, [cultoId]);

  async function buscarCultos() {
    const supabase = createClient();
    const { data } = await supabase
      .from('cultos')
      .select('*')
      .order('data', { ascending: true });
    if (data) setCultos(data as Culto[]);
  }

  async function buscarDepartamentos() {
    const supabase = createClient();
    const { data } = await supabase.from('departamentos').select('*').order('nome');
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

  /** Busca voluntários escalados no dia anterior ou posterior ao culto selecionado */
  async function buscarConflitos(idCulto: number) {
    const cultoRef = cultos.find(c => c.id === idCulto);
    if (!cultoRef) return;

    const dataBaseStr = extrairData(cultoRef.data);
    const dataBase = new Date(dataBaseStr + 'T12:00:00');

    const diaAnterior = new Date(dataBase);
    diaAnterior.setDate(diaAnterior.getDate() - 1);
    const diaAnteriorStr = diaAnterior.toISOString().split('T')[0];

    const diaSeguinte = new Date(dataBase);
    diaSeguinte.setDate(diaSeguinte.getDate() + 1);
    const diaSeguinteStr = diaSeguinte.toISOString().split('T')[0];

    const supabase = createClient();
    
    // 1. Busca IDs das escalas que ocorrem nos dias adjacentes
    const { data: escalasRef } = await supabase
      .from('escalas')
      .select('id, data_hora')
      .or(`data_hora.ilike.${diaAnteriorStr}%,data_hora.ilike.${diaSeguinteStr}%`);

    if (!escalasRef || escalasRef.length === 0) {
      setConflitos({});
      return;
    }

    // 2. Busca voluntários vinculados a essas escalas
    const idsEscalas = escalasRef.map(e => e.id);
    const { data: vinculos } = await supabase
      .from('escala_voluntarios')
      .select('voluntario_id, escala_id')
      .in('escala_id', idsEscalas);

    const novosConflitos: Record<number, string> = {};
    
    if (vinculos) {
      vinculos.forEach((v) => {
        const escalaInfo = escalasRef.find(e => e.id === v.escala_id);
        if (escalaInfo) {
          const dataConf = extrairData(escalaInfo.data_hora);
          novosConflitos[v.voluntario_id] = dataConf;
        }
      });
    }

    setConflitos(novosConflitos);
  }

  async function carregarEscala(id: number) {
    const supabase = createClient();
    const { data: escala, error: errE } = await supabase.from('escalas').select('*').eq('id', id).single();
    if (errE || !escala) {
      alert('Escala não encontrada');
      router.push('/');
      return;
    }
    setCultoId(escala.culto_id ?? '');
    setDepartamentoId(escala.departamento_id);
    setObservacoes(escala.observacoes || '');

    const { data: vols } = await supabase.from('voluntarios').select('*').eq('departamento_id', escala.departamento_id).eq('ativo', true).order('nome');
    if (vols) setVoluntarios(vols as Voluntario[]);

    const { data: vinculos } = await supabase.from('escala_voluntarios').select('voluntario_id').eq('escala_id', id);
    if (vinculos) setSelecionados(vinculos.map(v => v.voluntario_id));
    setInitialLoading(false);
  }

  const deptSelecionado = departamentos.find(d => d.id === departamentoId);
  const limiteMaximo = deptSelecionado ? LIMITES_DEPARTAMENTO[deptSelecionado.nome] || 99 : 99;

  function toggleVoluntario(id: number) {
    setSelecionados((prev) => {
      const isSelected = prev.includes(id);
      if (!isSelected && prev.length >= limiteMaximo) {
        return prev; // Não permite selecionar se atingiu o limite
      }
      return isSelected ? prev.filter((v) => v !== id) : [...prev, id];
    });
  }

  async function salvarEscala() {
    if (cultoId === '' || departamentoId === '' || selecionados.length === 0) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    // Validação Final de Segurança
    if (selecionados.length > limiteMaximo) {
      alert(`Limite excedido para ${deptSelecionado?.nome}. Máximo de ${limiteMaximo} pessoas.`);
      return;
    }

    // Verifica se algum selecionado está em conflito (burla do browser)
    const temConflito = selecionados.some(id => conflitos[id]);
    if (temConflito) {
      alert('Um ou mais voluntários selecionados já possuem escala em dias consecutivos.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (!editId) {
        const { data: existente } = await supabase.from('escalas').select('id').eq('culto_id', cultoId).eq('departamento_id', departamentoId).maybeSingle();
        if (existente) {
          alert('Já existe uma escala para este departamento neste culto.');
          setLoading(false);
          return;
        }
      }

      const cultoSelecionado = cultos.find((c) => c.id === cultoId);
      const dataHora = cultoSelecionado?.data ?? null;

      let escalaId: number;

      if (editId) {
        escalaId = Number(editId);
        const { error: errU } = await supabase.from('escalas').update({ culto_id: cultoId as number, departamento_id: departamentoId as number, data_hora: dataHora, observacoes: observacoes || null }).eq('id', escalaId);
        if (errU) throw errU;
        await supabase.from('escala_voluntarios').delete().eq('escala_id', escalaId);
      } else {
        const { data: novaEscala, error: erroEscala } = await supabase.from('escalas').insert({ data_hora: dataHora, culto_id: cultoId as number, departamento_id: departamentoId as number, observacoes: observacoes || null }).select('id').single();
        if (erroEscala || !novaEscala) throw erroEscala ?? new Error('Falha ao criar escala');
        escalaId = novaEscala.id;
      }

      const uniqueSelected = Array.from(new Set(selecionados));
      const vinculos = uniqueSelected.map((voluntario_id) => ({ escala_id: escalaId, voluntario_id }));
      const { error: erroVinculos } = await supabase.from('escala_voluntarios').insert(vinculos);
      if (erroVinculos) throw erroVinculos;

      alert(editId ? 'Escala atualizada!' : 'Escala criada!');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar escala.');
    } finally {
      setLoading(false);
    }
  }

  const cultoSelecionado = cultos.find((c) => c.id === cultoId);
  const isLimiteAtingido = selecionados.length >= limiteMaximo;

  if (initialLoading) return <div className="p-8 text-gray-500">Carregando dados da escala...</div>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {editId ? 'Editar Escala' : 'Criar Nova Escala'}
        </h1>
        <p className="text-gray-500">
          {editId ? 'Altere os voluntários ou departamento da escala' : 'Vincule uma escala a um culto existente'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Lado Esquerdo: Seleção e Informações */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-6 w-full lg:max-w-md shrink-0 shadow-sm">
          {/* Culto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Culto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Church size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={cultoId}
                onChange={(e) => setCultoId(Number(e.target.value) || '')}
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 appearance-none"
              >
                <option value="">Selecione o culto...</option>
                {cultos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatarCulto(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview do culto */}
          {cultoSelecionado && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <Church size={16} className="text-gray-400 shrink-0" />
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-gray-900">{cultoSelecionado.nome}</span>
                <span className="text-gray-500">
                  {(() => {
                    const d = extrairData(cultoSelecionado.data).split('-');
                    return `${d[2]}/${d[1]}/${d[0]} às ${extrairHora(cultoSelecionado.data)}`;
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Departamento */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Departamento <span className="text-red-500">*</span>
              </label>
              {deptSelecionado && limiteMaximo < 99 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLimiteAtingido ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selecionados.length}/{limiteMaximo} selecionados
                </span>
              )}
            </div>
            <select
              value={departamentoId}
              onChange={(e) => setDepartamentoId(Number(e.target.value) || '')}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              disabled={!!editId}
            >
              <option value="">Selecione o departamento...</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações..."
              rows={4}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={salvarEscala}
              disabled={loading}
              className="flex-1 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Salvar'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Lado Direito: Listagem de Voluntários */}
        <div className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-gray-900">Voluntários do Departamento</h2>
              <p className="text-sm text-gray-500">Selecione quem fará parte desta escala</p>
            </div>

            {voluntarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {voluntarios.map((vol) => {
                  const conflitoData = conflitos[vol.id];
                  const isDisabled = (conflitoData && !selecionados.includes(vol.id)) || (isLimiteAtingido && !selecionados.includes(vol.id));
                  
                  return (
                    <label
                      key={vol.id}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                        selecionados.includes(vol.id)
                          ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                          : 'border-gray-100 hover:bg-gray-50'
                      } ${
                        isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selecionados.includes(vol.id)}
                        onChange={() => !isDisabled && toggleVoluntario(vol.id)}
                        disabled={isDisabled}
                        className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-semibold truncate">{vol.nome}</span>
                          {vol.cargo && vol.cargo !== 'Voluntário' && (
                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">{vol.cargo}</span>
                          )}
                        </div>
                        
                        {conflitoData && (
                          <div className="flex items-center gap-1 text-red-500 mt-0.5">
                            <AlertCircle size={10} />
                            <span className="text-[10px] font-bold">
                              Em descanso ({formatarDiaMes(conflitoData)})
                            </span>
                          </div>
                        )}
                        {isLimiteAtingido && !selecionados.includes(vol.id) && !conflitoData && (
                          <span className="text-[10px] text-gray-400 italic">Limite atingido</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <Users size={32} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Nenhum voluntário encontrado para este departamento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NovaEscalaPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <EscalaForm />
    </Suspense>
  );
}
