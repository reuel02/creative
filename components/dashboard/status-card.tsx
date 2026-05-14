import React from "react";
import Link from "next/link";

interface StatcardProps {
    titulo: string
    valor: number
    icone: React.ReactNode
    href?: string
}

export default function Statcard({ titulo, valor, icone, href }: StatcardProps) {
    const content = (
        <div className={`bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow ${href ? 'cursor-pointer hover:border-blue-200' : ''}`}>
            <div className="flex flex-col flex-1">
                <p className="text-sm font-medium text-gray-500 leading-snug min-h-[40px] flex items-start">{titulo}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{valor}</p>
            </div>
            <div className="text-gray-400">
                {icone}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }

    return content;
}