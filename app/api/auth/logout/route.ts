import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Apaga o cookie do token, efetivamente deslogando o usuário.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("creative_token");
  return response;
}
