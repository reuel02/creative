"use client";

import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";



// Meses em português
const MESES_PT: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
  5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
  9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

interface UserProfile {
  id: number;
  nome: string;
  telefone: string;
  department_id: number;
  email: string | null;
  cargo: string;
  ativo: boolean;
  data_entrada: string | null;
  departamento_nome: string;
  total_escalas: number;
}

function formatarData(isoDate: string | null): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return `${d.getDate()} de ${MESES_PT[d.getMonth() + 1]} de ${d.getFullYear()}`;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);

  // Form state para edição
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formCargo, setFormCargo] = useState("");

  // ID do usuário fixo por enquanto (sem autenticação)
  const USER_ID = 1;

  useEffect(() => {
    buscarPerfil();
  }, []);

  async function buscarPerfil() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${USER_ID}`);
      if (!response.ok) throw new Error("Erro ao buscar perfil");
      const data: UserProfile = await response.json();
      setPerfil(data);
      setFormNome(data.nome);
      setFormEmail(data.email || "");
      setFormTelefone(data.telefone);
      setFormCargo(data.cargo);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarPerfil() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${USER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formNome,
          email: formEmail || null,
          telefone: formTelefone,
          cargo: formCargo,
        }),
      });
      if (!response.ok) throw new Error("Erro ao salvar perfil");
      setEditando(false);
      buscarPerfil();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar perfil");
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-gray-500">Informações pessoais</p>
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
            <p className="text-sm text-gray-500">{perfil.cargo}</p>
          </div>

          {/* Dados */}
          <div className="w-full flex flex-col gap-3 border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">
                {perfil.email || "—"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Membro desde</p>
              <p className="text-sm font-medium text-gray-900">
                {formatarData(perfil.data_entrada)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Total de Escalas Criadas</p>
              <p className="text-sm font-medium text-gray-900">
                {perfil.total_escalas}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Departamento</p>
              <p className="text-sm font-medium text-gray-900">
                {perfil.departamento_nome}
              </p>
            </div>
          </div>

          {/* Botão Editar Perfil */}
          <button
            onClick={() => setEditando(true)}
            className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Editar Perfil
          </button>
        </div>
      )}

      {/* Modal de Edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col gap-5 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                value={formTelefone}
                onChange={(e) => setFormTelefone(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Cargo</label>
              <select
                value={formCargo}
                onChange={(e) => setFormCargo(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="Voluntário">Voluntário</option>
                <option value="Líder">Líder</option>
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={salvarPerfil}
                className="flex-1 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditando(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
