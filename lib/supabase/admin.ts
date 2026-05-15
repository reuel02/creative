/**
 * lib/supabase/admin.ts
 *
 * Cliente Supabase com a service_role key (acesso total, ignora RLS).
 * Use APENAS em Route Handlers ou Server Actions — NUNCA exponha ao browser.
 *
 * Usa a API de autenticação administrativa para criar/gerenciar usuários líderes.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para o cliente admin.'
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: { schema: 'creative' },
  });
}
