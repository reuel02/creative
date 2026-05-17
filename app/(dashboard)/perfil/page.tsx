'use client';

import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Meses em português
const MESES_PT: Record<number, string> = {
  1: 'Janeiro',  2: 'Fevereiro', 3: 'Março',    4: 'Abril',
  5: 'Maio',     6: 'Junho',     7: 'Julho',    8: 'Agosto',
  9: 'Setembro', 10: 'Outubro',  11: 'Novembro', 12: 'Dezembro',
};

interface LiderProfile {
  id: string;
  email: string;
  nome: string;
  criado_em: string;
}

function formatarData(isoDate: string | null): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return `${d.getDate()} de ${MESES_PT[d.getMonth() + 1]} de ${d.getFullYear()}`;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<LiderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarPerfil();
  }, []);

  async function buscarPerfil() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setPerfil({
        id: user.id,
        email: user.email ?? '',
        nome: user.user_metadata?.nome || user.user_metadata?.full_name || user.user_metadata?.name || 'Líder',
        criado_em: user.created_at,
      });
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-gray-500">Informações da sua conta de líder</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <p className="text-sm font-medium text-gray-500 animate-pulse">Carregando perfil...</p>
        </div>
      )}

      {perfil && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col items-center gap-6 w-full max-w-2xl mt-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center">
            <UserCircle size={56} className="text-slate-300" strokeWidth={1.2} />
          </div>

          {/* Nome e cargo */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{perfil.nome}</h2>
            <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Líder Administrativo
            </span>
          </div>

          {/* Dados */}
          <div className="w-full flex flex-col gap-4 border-t border-slate-100 pt-8 mt-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-slate-50 p-4 rounded-2xl">
              <p className="text-sm font-semibold text-slate-500">Email de Acesso</p>
              <p className="text-sm font-bold text-slate-900">{perfil.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-slate-50 p-4 rounded-2xl">
              <p className="text-sm font-semibold text-slate-500">Membro desde</p>
              <p className="text-sm font-bold text-slate-900">
                {formatarData(perfil.criado_em)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
