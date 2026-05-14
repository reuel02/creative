import { NextRequest, NextResponse } from "next/server";

/** Rotas que não exigem autenticação */
const PUBLIC_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("creative_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Sem token em rota privada → redireciona para login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Com token em rota pública (login/register) → redireciona para dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Aplica o middleware em todas as rotas exceto:
   * - /api/* (Route Handlers internos)
   * - /_next/* (assets estáticos do Next.js)
   * - /favicon.ico, imagens SVG e demais arquivos públicos
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)",
  ],
};
