/**
 * app/api/auth/logout/route.ts
 *
 * POST /api/auth/logout
 *
 * Encerra a sessão do Supabase Auth e limpa os cookies de autenticação.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
