/**
 * app/api/auth/login/route.ts
 *
 * POST /api/auth/login
 *
 * Autentica um líder via Supabase Auth (signInWithPassword).
 * Os tokens são gerenciados automaticamente via cookies pelo @supabase/ssr.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Credenciais inválidas
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_credentials')
      ) {
        return NextResponse.json(
          { error: 'E-mail ou senha inválidos.' },
          { status: 401 }
        );
      }

      // Email não confirmado
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Confirme seu e-mail antes de fazer login.' },
          { status: 401 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Supabase já gerencia os cookies de sessão via @supabase/ssr
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
