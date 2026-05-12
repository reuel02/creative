import Statcard from "@/components/dashboard/status-card";
import EscalaCard, { EscalaCardProps } from "@/components/dashboard/escala-card";
import { Briefcase, Calendar, Church, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [dadosDashboard, setDadosDashboard] = useState({
    total_schedules: 0,
    total_users: 0,
    total_departments: 0,
    total_cults: 0
  });
  

  useEffect(() => {
    buscarDadosDashboard()
  }, [])

  async function buscarDadosDashboard() {
    try {
      const response = await fetch("https://creative-api-b71t.onrender.com/dashboard/metricas")

      if (!response.ok) {
        throw new Error("Erro na API");
      }

      const data = await response.json();

      setDadosDashboard(data);

    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Ocorreu um erro desconhecido");
      }
    }
  }
  
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ESCALAS DA IGREJA</h1>
        <p className="text-gray-500">Gerencie as escalas de voluntários</p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Statcard titulo={"Total de Escalas"} valor={dadosDashboard.total_escalas} icone={<Calendar size={28} strokeWidth={1.5} />} href="/escalas" />
        <Statcard titulo={"Voluntários Ativos"} valor={dadosDashboard.total_users} icone={<Users size={28} strokeWidth={1.5} />} href="/voluntarios" />
        <Statcard titulo={"Departamentos"} valor={"2"} icone={<Briefcase size={28} strokeWidth={1.5} />} href="/departamentos" />
        <Statcard titulo={"Total de Cultos"} valor={"4"} icone={<Church size={28} strokeWidth={1.5} />} href="/alertas" />
      </div>

      {/* Seção Escalas de Março */}
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-xl font-bold text-gray-900">Escalas de Março</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {escalasMock.map((escala, index) => (
            <EscalaCard key={index} {...escala} />
          ))}
        </div>
      </div>
    </div>
  );
}
