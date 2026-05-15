'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera,
  Monitor,
  Power,
  Video,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

/**
 * Componente interno que usa useSearchParams().
 * Deve ser envolto em <Suspense> para evitar erro de pré-renderização no Next.js 16.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    // Autenticação direta no Supabase — sem intermediário
    // O @supabase/ssr gerencia os cookies de sessão automaticamente no browser
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const mensagens: Record<string, string> = {
        'Invalid login credentials': 'E-mail ou senha inválidos.',
        'invalid_credentials': 'E-mail ou senha inválidos.',
        'Email not confirmed': 'Confirme seu e-mail antes de fazer login.',
        'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
      };

      const mensagem =
        Object.entries(mensagens).find(([key]) => error.message.includes(key))?.[1]
        ?? error.message;

      setErro(mensagem);
      setLoading(false);
      return;
    }

    // Redireciona para a rota original ou para o dashboard
    const from = searchParams.get('from') || '/';
    router.push(from);
    router.refresh(); // Força o middleware a reler os cookies de sessão
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo E-mail */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 ml-1">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="exemplo@igreja.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          required
          autoComplete="email"
        />
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label className="text-sm font-semibold text-slate-700">Senha</label>
          <button
            type="button"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Checkbox Lembrar */}
      <div className="flex items-center gap-2 ml-1">
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer">
          Manter conectado
        </label>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <span>{erro}</span>
        </div>
      )}

      {/* Botão de Entrar */}
      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="w-full bg-creative-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-slate-900 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Entrar no Sistema
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── PAINEL ESQUERDO: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-creative-dark relative overflow-hidden flex-col justify-between p-16">
        {/* Efeitos de luz */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10">
          <h1 className="text-white text-5xl font-black leading-tight tracking-tighter mb-6">
            Gerencie sua <br />
            <span className="text-blue-400">Equipe de Escalas</span> <br />
            com inteligência.
          </h1>
          <p className="text-creative-text text-lg max-w-md leading-relaxed">
            Uma plataforma robusta para organizar voluntários, departamentos e
            cultos em um só lugar.
          </p>

          <div className="flex gap-4 mt-10">
            {[Camera, Monitor, Power, Video].map((Icon, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/40"
              >
                <Icon size={20} />
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10">
          <p className="text-white/30 text-sm">
            © 2026 Creative System · Gestão de Voluntários
          </p>
        </div>
      </div>

      {/* ── PAINEL DIREITO: Formulário ── */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="Creative"
              width={120}
              height={32}
              style={{ height: 'auto' }}
              priority
            />
          </div>

          {/* Cabeçalho */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-500 mt-2">
              Acesse sua conta para gerenciar as escalas
            </p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            {/* Suspense obrigatório para useSearchParams() em Next.js 16 */}
            <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-2xl" />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Link para admin */}
          <p className="text-center text-slate-500 text-sm">
            É administrador?{' '}
            <a
              href="/register"
              className="font-bold text-slate-900 hover:underline"
            >
              Criar conta de líder
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}