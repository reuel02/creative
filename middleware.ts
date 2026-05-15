/**
 * middleware.ts
 *
 * Protege rotas privadas verificando a sessão do Supabase Auth.
 * Usa createServerClient do @supabase/ssr para ler/renovar tokens via cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/** Rotas que não exigem autenticação */
const PUBLIC_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  let response = NextResponse.next({
    request,
  });

  // Cria cliente Supabase com acesso aos cookies da requisição
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'creative' },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Atualiza cookies tanto na request quanto na response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtém sessão atual (renova automaticamente o access_token se necessário)
  // Usamos try-catch para evitar que erros de rede (proxy/SSL) travem a aplicação
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data) {
      user = data.user;
    }
  } catch (error) {
    console.error('Erro de conexão no middleware (Supabase):', error);
  }

  // Sem sessão em rota privada → redireciona para login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Com sessão em rota pública → redireciona para dashboard
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  /*
   * Aplica o middleware em todas as rotas exceto:
   * - /api/* (Route Handlers internos)
   * - /_next/* (assets estáticos do Next.js)
   * - /favicon.ico, imagens SVG e demais arquivos públicos
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)',
  ],
};
