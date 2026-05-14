/**
 * lib/auth.ts
 * Funções utilitárias de autenticação para uso server-side.
 * Nunca expõe o JWT diretamente ao cliente.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Chama o endpoint de login do FastAPI e retorna o JWT.
 * Deve ser usado apenas em Route Handlers (server-side).
 */
export async function loginAPI(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Credenciais inválidas");
  }

  return response.json();
}

/**
 * Chama o endpoint de cadastro de líderes do FastAPI.
 * Deve ser usado apenas em Route Handlers (server-side).
 */
export async function registerAPI(
  nome: string,
  email: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erro ao criar conta");
  }
}
