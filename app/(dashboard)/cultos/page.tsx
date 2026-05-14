"use client";

import { Church, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";



interface Culto {
  id: number;
  nome: string;
  data: string;
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

export default function CultosPage() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formData, setFormData] = useState("");
  const [formHora, setFormHora] = useState("");

  useEffect(() => {
    buscarCultos();
  }, []);

  async function buscarCultos() {
    try {
      const response = await fetch(`${API_BASE_URL}/cultos/`);
      if (!response.ok) throw new Error("Erro");
      const data: Culto[] = await response.json();
      setCultos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalCriar() {
    setEditandoId(null);
    setFormNome("");
    setFormData("");
    setFormHora("");
    setModalAberto(true);
  }

  function abrirModalEditar(culto: Culto) {
    setEditandoId(culto.id);
    setFormNome(culto.nome);
    const d = new Date(culto.data);
    setFormData(d.toISOString().split("T")[0]);
    setFormHora(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setModalAberto(true);
  }

  async function salvar() {
    if (!formNome || !formData || !formHora) {
      alert("Preencha todos os campos");
      return;
    }

    const dataISO = `${formData}T${formHora}:00`;

    try {
      if (editandoId) {
        // Editar
        const response = await fetch(`${API_BASE_URL}/cultos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: formNome, data: dataISO }),
        });
        if (!response.ok) throw new Error("Erro ao editar");
      } else {
        // Criar
        const response = await fetch(`${API_BASE_URL}/cultos/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: formNome, data: dataISO }),
        });
        if (!response.ok) throw new Error("Erro ao criar");
      }

      setModalAberto(false);
      buscarCultos();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar culto");
    }
  }

  async function excluir(id: number) {
    if (!confirm("Tem certeza que deseja excluir este culto?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cultos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao excluir");
      buscarCultos();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir culto");
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Cultos
          </h1>
          <p className="text-gray-500">Gerenciar cultos e eventos</p>
        </div>
        <button
          onClick={abrirModalCriar}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Novo Culto
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando cultos...</p>}

      {/* Lista de Cultos */}
      {cultos.length === 0 && !loading && (
        <p className="text-sm text-gray-400">Nenhum culto cadastrado.</p>
      )}

      <div className="flex flex-col gap-3">
        {cultos.map((culto) => (
          <div
            key={culto.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Church size={20} className="text-gray-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-900">
                  {culto.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {formatarDataHora(culto.data)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => abrirModalEditar(culto)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => excluir(culto.id)}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar/Editar */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col gap-5 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              {editandoId ? "Editar Culto" : "Novo Culto"}
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Culto de Domingo"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Data</label>
              <input
                type="date"
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Horário
              </label>
              <input
                type="time"
                value={formHora}
                onChange={(e) => setFormHora(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={salvar}
                className="flex-1 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {editandoId ? "Salvar Alterações" : "Criar Culto"}
              </button>
              <button
                onClick={() => setModalAberto(false)}
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
