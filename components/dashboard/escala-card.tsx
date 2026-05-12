import { Check, CircleAlert, TriangleAlert } from "lucide-react";
import React from "react";

export interface Equipe {
    nome: string;
    membros: string;
    alerta?: string;
}

export interface EscalaCardProps {
    data: string;
    diaHora: string;
    status: "confirmada" | "alerta";
    equipes: Equipe[];
}

export default function EscalaCard({ data, diaHora, status, equipes }: EscalaCardProps) {
    const isConfirmada = status === "confirmada";

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">{data}</p>
                    <p className="text-lg font-bold text-gray-900">{diaHora}</p>
                </div>
                
                {/* Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isConfirmada 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-orange-50 text-orange-600 border border-orange-200"
                }`}>
                    {isConfirmada ? <Check size={14} strokeWidth={2.5} /> : <CircleAlert size={14} strokeWidth={2.5} />}
                    {isConfirmada ? "Confirmada" : "Alerta"}
                </div>
            </div>

            {/* Equipes */}
            <div className="flex flex-col gap-4">
                {equipes.map((equipe, index) => (
                    <div key={index} className="flex flex-col gap-1">
                        <p className="text-sm text-gray-500">{equipe.nome}</p>
                        {equipe.alerta ? (
                            <div className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                                <TriangleAlert size={16} />
                                <p>{equipe.alerta}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-900">{equipe.membros}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
