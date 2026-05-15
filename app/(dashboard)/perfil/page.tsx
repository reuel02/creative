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
        nome: user.user_metadata?.nome ?? user.email ?? 'Líder',
        criado_em: user.created_at,
      });
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-gray-500">Informações da sua conta de líder</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando perfil...</p>}

      {perfil && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-6 max-w-lg">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle size={48} className="text-gray-400" strokeWidth={1.2} />
          </div>

          {/* Nome e cargo */}
          <div className="flex flex-col items-center gap-0.5">
            <h2 className="text-xl font-bold text-gray-900">{perfil.nome}</h2>
            <p className="text-sm text-gray-500">Líder</p>
          </div>

          {/* Dados */}
          <div className="w-full flex flex-col gap-3 border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{perfil.email}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Membro desde</p>
              <p className="text-sm font-medium text-gray-900">
                {formatarData(perfil.criado_em)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
