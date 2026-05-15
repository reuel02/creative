/**
 * lib/auth.ts
 *
 * Helpers de autenticação server-side usando Supabase Auth.
 * Usado pelos Route Handlers e Server Components.
 *
 * O FastAPI foi substituído — todas as operações de auth passam pelo Supabase.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Retorna o usuário autenticado atual (a partir dos cookies de sessão).
 * Retorna null se não houver sessão ativa ou houver erro de conexão.
 */
export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário (auth.ts):', error);
    return null;
  }
}

/**
 * Retorna a sessão atual.
 * Útil para obter o access_token quando necessário.
 */
export async function getSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Erro ao buscar sessão (auth.ts):', error);
    return null;
  }
}
