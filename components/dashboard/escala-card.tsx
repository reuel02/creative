import { Check, CircleAlert, TriangleAlert, XCircle, Church, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface Equipe {
    id: number;
    nome: string;
    membros: string;
    alerta?: string;
}

export interface EscalaCardProps {
    /** "Sábado, 16/05/2026" */
    data: string;
    /** Nome do culto + horário, ex: "Culto de Domingo • 19:30" */
    cultoInfo?: string;
    status: "confirmada" | "alerta" | "critica";
    equipes: Equipe[];
    onDelete?: (id: number) => void;
}

export default function EscalaCard({ data, cultoInfo, status, equipes, onDelete }: EscalaCardProps) {
    const isConfirmada = status === "confirmada";
    const isCritica = status === "critica";

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-gray-900">{data}</p>
                    {cultoInfo && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Church size={13} />
                            <span>{cultoInfo}</span>
                        </div>
                    )}
                </div>

                {/* Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                    isConfirmada
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : isCritica
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-orange-50 text-orange-600 border border-orange-200"
                }`}>
                    {isConfirmada
                        ? <Check size={14} strokeWidth={2.5} />
                        : isCritica
                        ? <XCircle size={14} strokeWidth={2.5} />
                        : <CircleAlert size={14} strokeWidth={2.5} />}
                    {isConfirmada ? "Confirmada" : isCritica ? "Crítica" : "Alerta"}
                </div>
            </div>

            {/* Equipes */}
            <div className="flex flex-col gap-4">
                {equipes.map((equipe, index) => (
                    <div key={index} className="flex flex-col gap-1 group">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                {equipe.nome}
                            </p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Link 
                                    href={`/escala?id=${equipe.id}`}
                                    className="p-1 rounded bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                    title="Editar esta equipe"
                                >
                                    <Pencil size={12} />
                                </Link>
                                <button
                                    onClick={() => onDelete?.(equipe.id)}
                                    className="p-1 rounded bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    title="Excluir esta equipe"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        {/* Mostra nomes se existirem, senão mostra alerta */}
                        {equipe.membros ? (
                            <p className="text-sm text-gray-900">{equipe.membros}</p>
                        ) : (
                            <div className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                                <TriangleAlert size={14} />
                                <p>{equipe.alerta ?? "Poucos voluntários escalados"}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
