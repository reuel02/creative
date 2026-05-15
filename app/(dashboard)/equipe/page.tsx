'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  UserPlus,
  Loader2,
  Users,
  Phone,
} from 'lucide-react';
import type { Departamento, VoluntarioComDepartamento } from '@/lib/types/database';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getIniciais(nome: string): string {
  const partes = nome.trim().split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.substring(0, 2).toUpperCase();
}

function getDeptIcon(nome: string): string {
  const lower = nome.toLowerCase();
  if (lower.includes('corte') || lower.includes('câmera') || lower.includes('camera')) return '🎬';
  if (lower.includes('iluminação') || lower.includes('iluminacao') || lower.includes('luz')) return '💡';
  if (lower.includes('som') || lower.includes('áudio') || lower.includes('audio')) return '🎵';
  if (lower.includes('mídia') || lower.includes('midia')) return '📱';
  if (lower.includes('transmissão') || lower.includes('transmissao')) return '📡';
  return '⚙️';
}

// ─── Agrupamento por Departamento ────────────────────────────────────────────

interface DepartamentoGrupo {
  nome: string;
  voluntarios: VoluntarioComDepartamento[];
}

function agruparPorDepartamento(voluntarios: VoluntarioComDepartamento[]): DepartamentoGrupo[] {
  const mapa: Record<string, VoluntarioComDepartamento[]> = {};

  for (const v of voluntarios) {
    const dept = v.departamentos?.nome ?? 'Sem departamento';
    if (!mapa[dept]) mapa[dept] = [];
    mapa[dept].push(v);
  }

  return Object.entries(mapa).map(([nome, voluntarios]) => ({ nome, voluntarios }));
}

// ─── Modal de Cadastro de Voluntário ─────────────────────────────────────────

interface NovoVoluntarioModalProps {
  departamentos: Departamento[];
  onClose: () => void;
  onSuccess: () => void;
}

function NovoVoluntarioModal({ departamentos, onClose, onSuccess }: NovoVoluntarioModalProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('Voluntário');
  const [departamentoId, setDepartamentoId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || departamentoId === '') {
      setErro('Preencha o nome e selecione o departamento.');
      return;
    }

    setLoading(true);
    setErro(null);

    const supabase = createClient();

    const { error } = await supabase.from('voluntarios').insert({
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      cargo: cargo.trim() || 'Voluntário',
      departamento_id: departamentoId as number,
      ativo: true,
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cadastrar novo voluntário"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Novo Voluntário</h3>
              <p className="text-gray-500 text-xs">Preencha os dados do voluntário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              id="vol-nome"
              type="text"
              placeholder="João da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
              required
            />
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="vol-telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Cargo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Cargo / Função
            </label>
            <input
              id="vol-cargo"
              type="text"
              placeholder="Ex: Cameraman, Operador de Som..."
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
            />
          </div>

          {/* Departamento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Departamento <span className="text-red-500">*</span>
            </label>
            <select
              id="vol-departamento"
              value={departamentoId}
              onChange={(e) => setDepartamentoId(Number(e.target.value) || '')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm text-gray-900"
              required
            >
              <option value="">Selecione o departamento...</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          {/* Erro */}
          {erro && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{erro}</span>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="vol-submit"
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Cadastrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function EquipePage() {
  const [grupos, setGrupos] = useState<DepartamentoGrupo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const buscarEquipes = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('voluntarios')
      .select('*, departamentos(id, nome)')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (!error) {
      setGrupos(agruparPorDepartamento((data as VoluntarioComDepartamento[]) ?? []));
    }
    setLoading(false);
  }, []);

  async function buscarDepartamentos() {
    const supabase = createClient();
    const { data } = await supabase
      .from('departamentos')
      .select('id, nome')
      .order('nome');
    if (data) setDepartamentos(data as Departamento[]);
  }

  useEffect(() => {
    buscarEquipes();
    buscarDepartamentos();
  }, [buscarEquipes]);

  function handleSuccess() {
    setModalAberto(false);
    setLoading(true);
    buscarEquipes();
  }

  return (
    <>
      {/* Modal de novo voluntário */}
      {modalAberto && (
        <NovoVoluntarioModal
          departamentos={departamentos}
          onClose={() => setModalAberto(false)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="flex flex-col gap-8 w-full max-w-7xl">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Equipes de Voluntários
            </h1>
            <p className="text-gray-500">Gerenciar equipes e voluntários</p>
          </div>

          <button
            id="btn-novo-voluntario"
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-gray-900/20 self-start sm:self-auto"
          >
            <UserPlus size={18} />
            Novo Voluntário
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-200 rounded" />
                  <div className="h-5 w-40 bg-gray-200 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3 w-24 bg-gray-200 rounded-full" />
                        <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && grupos.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Users size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum voluntário cadastrado</p>
            <p className="text-gray-400 text-sm">
              Clique em &quot;Novo Voluntário&quot; para adicionar o primeiro.
            </p>
          </div>
        )}

        {/* Cards por Departamento */}
        {!loading &&
          grupos.map((grupo) => (
            <div
              key={grupo.nome}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
            >
              {/* Header do Departamento */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getDeptIcon(grupo.nome)}</span>
                  <h2 className="text-lg font-bold text-gray-900">{grupo.nome}</h2>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                  {grupo.voluntarios.length}{' '}
                  {grupo.voluntarios.length === 1 ? 'membro' : 'membros'}
                </span>
              </div>

              {/* Grid de Voluntários */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grupo.voluntarios.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 transition-colors"
                  >
                    {/* Avatar com iniciais */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {getIniciais(vol.nome)}
                    </div>

                    {/* Nome, cargo e telefone */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{vol.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{vol.cargo}</p>
                      {vol.telefone && (
                        <a
                          href={`https://wa.me/55${vol.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 mt-0.5 truncate"
                        >
                          <Phone size={10} />
                          {vol.telefone}
                        </a>
                      )}
                    </div>

                    {/* Bolinha de status */}
                    <div
                      title={vol.ativo ? 'Ativo' : 'Inativo'}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        vol.ativo ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
