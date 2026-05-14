"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";



interface Department {
  id: number;
  nome: string;
}

interface Voluntario {
  id: number;
  nome: string;
  cargo: string;
}

export default function NovaEscalaPage() {
  const router = useRouter();
  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [departamentoId, setDepartamentoId] = useState<number | "">("");
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    buscarDepartamentos();
  }, []);

  useEffect(() => {
    if (departamentoId !== "") {
      buscarVoluntarios(departamentoId as number);
    } else {
      setVoluntarios([]);
    }
    setSelecionados([]);
  }, [departamentoId]);

  async function buscarDepartamentos() {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/`);
      if (!response.ok) throw new Error("Erro ao buscar departamentos");
      const data: Department[] = await response.json();
      setDepartamentos(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarVoluntarios(deptId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/department/${deptId}`
      );
      if (!response.ok) throw new Error("Erro ao buscar voluntários");
      const data: Voluntario[] = await response.json();
      setVoluntarios(data);
    } catch (error) {
      console.error(error);
    }
  }

  function toggleVoluntario(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  async function salvarEscala() {
    if (!data || !horario || departamentoId === "" || selecionados.length === 0) {
      alert("Preencha todos os campos obrigatórios e selecione ao menos 1 voluntário.");
      return;
    }

    setLoading(true);
    try {
      const dataHora = `${data}T${horario}:00`;
      const response = await fetch(`${API_BASE_URL}/schedules/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data_hora: dataHora,
          department_id: departamentoId,
          culto_id: null,
          voluntarios_ids: selecionados,
          observacoes: observacoes || null,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar escala");

      alert("Escala criada com sucesso!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar escala");
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
            onChange={(e) => setDepartamentoId(Number(e.target.value) || "")}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="">Selecione...</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
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
                </label>
              ))}
            </div>
          </div>
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
            {loading ? "Salvando..." : "Salvar Escala"}
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
