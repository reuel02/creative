/**
 * lib/supabase/client.ts
 *
 * Cliente Supabase para uso em Client Components ("use client").
 * Usa createBrowserClient do @supabase/ssr, que gerencia cookies
 * automaticamente no browser.
 *
 * IMPORTANTE: Nunca use este cliente em Server Components ou Route Handlers —
 * use lib/supabase/server.ts para isso.
 *
 * NOTA SOBRE TIPAGEM: O cliente é criado sem o generic Database para evitar
 * conflitos de inferência de tipo em schemas personalizados. As queries usam
 * asserção de tipo explícita (as Type[]) nos sites de chamada.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: { schema: 'creative' },
    }
  );
}
