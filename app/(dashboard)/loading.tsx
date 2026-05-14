/**
 * app/(dashboard)/loading.tsx
 *
 * Arquivo especial do Next.js App Router.
 * Renderizado automaticamente via Suspense enquanto a página (Server Component)
 * ainda está buscando dados. Substitui o texto "Carregando..." por
 * skeletons visuais elegantes.
 */
import { DashboardSkeleton } from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      <DashboardSkeleton />
    </div>
  );
}
