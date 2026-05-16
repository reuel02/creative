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

    const from = searchParams.get('from') || '/';
    router.push(from);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="exemplo@igreja.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Senha</label>
          <button
            type="button"
            className="text-xs font-bold text-blue-600 hover:underline"
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
            className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-1">
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer">
          Manter conectado
        </label>
      </div>

      {erro && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <span>{erro}</span>
        </div>
      )}

      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Entrar no Sistema
            <ArrowRight size={20} />
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
      <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] bg-creative-dark relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          {/* Logo Branding */}
          <div className="mb-12">
            <Image
              src="/logo.svg"
              alt="Creative"
              width={180}
              height={48}
              className="brightness-200"
              priority
            />
          </div>

          <h1 className="text-white text-5xl xl:text-6xl font-black leading-tight tracking-tighter mb-6">
            Gerencie sua <br />
            <span className="text-blue-400">Equipe de Escalas</span> <br />
            com inteligência.
          </h1>
          <p className="text-creative-text text-lg max-w-sm leading-relaxed opacity-80">
            Uma plataforma robusta para organizar voluntários, departamentos e
            cultos em um só lugar.
          </p>

          <div className="flex gap-4 mt-12">
            {[Camera, Monitor, Power, Video].map((Icon, i) => (
              <div
                key={i}
                className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white/40 backdrop-blur-sm"
              >
                <Icon size={22} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs tracking-widest uppercase font-medium">
            © 2026 Creative System · Gestão de Voluntários
          </p>
        </div>
      </div>

      {/* ── PAINEL DIREITO: Formulário ── */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 xl:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-6">
            <div className="bg-slate-900 px-6 py-4 rounded-2xl shadow-xl">
               <Image
                 src="/logo.svg"
                 alt="Creative"
                 width={140}
                 height={36}
                 className="brightness-200"
                 priority
               />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-500 mt-3 text-lg">
              Acesse sua conta para gerenciar as escalas
            </p>
          </div>

          <div className="bg-white p-8 xl:p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60">
            <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-2xl" />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-center text-slate-500 font-medium">
            É administrador?{' '}
            <a
              href="/register"
              className="text-slate-900 hover:underline font-black"
            >
              Criar conta de líder
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}