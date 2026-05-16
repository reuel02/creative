/**
 * lib/supabase/server.ts
 *
 * Cliente Supabase para uso em Server Components, Route Handlers e
 * Server Actions. Usa createServerClient do @supabase/ssr, que lê/escreve
 * cookies via next/headers automaticamente.
 *
 * IMPORTANTE: Só pode ser usado em contexto server-side (sem "use client").
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: { schema: 'creative' },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Pode falhar em Server Components (read-only) — ignorar
          }
        },
      },
    }
  );
}
