/**
 * components/dashboard/skeletons.tsx
 * Componentes de Skeleton para exibir durante carregamento de dados.
 * Usam animação "pulse" do Tailwind para feedback visual elegante.
 */

/** Skeleton para os cards de estatísticas (4 cards no grid) */
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-24 bg-slate-200 rounded-full" />
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-8 w-16 bg-slate-200 rounded-lg" />
      <div className="h-3 w-20 bg-slate-100 rounded-full" />
    </div>
  );
}

/** Skeleton para o grid de 4 stat cards */
export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton para um EscalaCard */
export function EscalaCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 bg-slate-200 rounded-full" />
          <div className="h-3 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="h-6 w-20 bg-slate-200 rounded-full" />
      </div>
      {/* Equipes */}
      <div className="flex flex-col gap-3 mt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-24 bg-slate-200 rounded-full" />
              <div className="h-2.5 w-36 bg-slate-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton para o grid de escalas do mês */
export function EscalasGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <EscalaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton completo do Dashboard */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl animate-pulse">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-44 bg-slate-100 rounded-full" />
      </div>

      <StatGridSkeleton />

      {/* Seção escalas */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-slate-200 rounded-lg" />
          <div className="flex gap-3">
            <div className="h-8 w-28 bg-slate-200 rounded-lg" />
            <div className="h-8 w-16 bg-slate-200 rounded-lg" />
          </div>
        </div>
        <EscalasGridSkeleton />
      </div>
    </div>
  );
}
