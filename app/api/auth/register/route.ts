/**
 * app/api/auth/register/route.ts
 *
 * POST /api/auth/register
 *
 * Cadastra um novo líder via Supabase Auth (signUp).
 * Usa o cliente admin (service_role) para criar o usuário sem exigir
 * confirmação de e-mail, pois o registro é feito por um administrador.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, password } = await request.json();

    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    // Usa cliente admin para criar o usuário sem confirmação de e-mail
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // confirma automaticamente — sem e-mail de verificação
      user_metadata: { nome },
    });

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already been registered')
      ) {
        return NextResponse.json(
          { error: 'Este e-mail já está cadastrado.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
