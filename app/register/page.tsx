'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Monitor,
  Power,
  Video,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function Register() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (password !== confirm) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    });

    if (error) {
      const mensagens: Record<string, string> = {
        'User already registered': 'Este e-mail já está cadastrado.',
        'already been registered': 'Este e-mail já está cadastrado.',
        'Password should be at least': 'A senha deve ter ao menos 6 caracteres.',
        'Unable to validate email': 'E-mail inválido.',
      };

      const mensagem =
        Object.entries(mensagens).find(([key]) => error.message.includes(key))?.[1]
        ?? error.message;

      setErro(mensagem);
      setLoading(false);
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── PAINEL ESQUERDO: Branding ── */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] bg-creative-dark relative overflow-hidden flex-col justify-between p-16">
        {/* Efeitos de luz */}
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

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-white/70 text-sm font-medium tracking-wide">
              Acesso Restrito — Somente Líderes
            </span>
          </div>

          <h1 className="text-white text-5xl xl:text-6xl font-black leading-tight tracking-tighter mb-6">
            Crie sua conta <br />
            <span className="text-blue-400">de Liderança</span> <br />
            no sistema.
          </h1>
          <p className="text-creative-text text-lg max-w-sm leading-relaxed opacity-80">
            Líderes e administradores têm acesso completo para gerenciar
            voluntários, escalas e departamentos.
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
          {/* Logo mobile (Visible on white background, so we invert it) */}
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

          {/* Cabeçalho */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 tracking-tight">
              Criar conta de líder
            </h2>
            <p className="text-slate-500 mt-3 text-lg">
              Preencha os dados para sua conta de acesso
            </p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white p-8 xl:p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60">
            {sucesso ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <ShieldCheck size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Conta criada com sucesso!
                </h3>
                <p className="text-slate-500">
                  Verifique seu e-mail para confirmar a conta, depois faça login.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                    Nome completo
                  </label>
                  <input
                    id="reg-nome"
                    type="text"
                    placeholder="João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    required
                    autoComplete="name"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                    E-mail
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="exemplo@igreja.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                      autoComplete="new-password"
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

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                {erro && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{erro}</span>
                  </div>
                )}

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta de Líder
                      <UserPlus size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-slate-500 font-medium">
            Já tem conta?{' '}
            <a
              href="/login"
              className="text-slate-900 hover:underline font-black"
            >
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
