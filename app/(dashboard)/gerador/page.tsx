/**
 * app/(dashboard)/gerador/page.tsx
 *
 * Shell da página do Gerador Inteligente.
 * O formulário pesado (GeradorForm) é carregado via next/dynamic com ssr: false,
 * garantindo que o JS desse componente só seja baixado quando o usuário
 * navegar para esta rota — Code Splitting automático.
 */
"use client";

import dynamic from "next/dynamic";
import { Lightbulb } from "lucide-react";
import { GeradorFormSkeleton } from "@/components/gerador/GeradorForm";

// Carrega o formulário pesado apenas quando a rota é visitada
const GeradorForm = dynamic(
  () => import("@/components/gerador/GeradorForm"),
  {
    loading: () => <GeradorFormSkeleton />,
    ssr: false,
  }
);

export default function GeradorPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Gerador Inteligente
        </h1>
        <p className="text-gray-500">Gere escalas automaticamente com IA</p>
      </div>

      {/* Grid responsivo: formulário (2/3) + dica (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário — carregado via next/dynamic */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight uppercase mb-6">
            Gerador de Escalas Inteligente
          </h2>
          <GeradorForm />
        </div>

        {/* Card de Dica */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-3 h-fit">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900">Dica</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            O gerador inteligente analisa histórico de disponibilidade e cria
            escalas balanceadas automaticamente para os domingos do mês
            selecionado.
          </p>
          <div className="mt-2 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              Como funciona
            </p>
            <ul className="flex flex-col gap-1.5 text-xs text-gray-500">
              <li className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Selecione o mês e departamento
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Defina a quantidade de cultos
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Clique em Gerar — a IA distribui os voluntários
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
