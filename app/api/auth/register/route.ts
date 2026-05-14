import { NextRequest, NextResponse } from "next/server";
import { registerAPI } from "@/lib/auth";

/**
 * POST /api/auth/register
 *
 * Cadastra um novo líder no sistema.
 * Esta rota é chamada pela página /register (acesso restrito a admins).
 */
export async function POST(request: NextRequest) {
  try {
    const { nome, email, password } = await request.json();

    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    await registerAPI(nome, email, password);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
