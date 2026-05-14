import { NextRequest, NextResponse } from "next/server";
import { loginAPI } from "@/lib/auth";

/**
 * POST /api/auth/login
 *
 * Recebe email e senha, autentica no FastAPI, e seta o JWT
 * em um cookie HttpOnly (inacessível ao JavaScript do browser → proteção XSS).
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const { access_token } = await loginAPI(email, password);

    const response = NextResponse.json({ success: true });

    // Cookie HttpOnly: o JWT fica no servidor, nunca exposto ao JS do cliente
    response.cookies.set("creative_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
