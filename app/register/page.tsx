"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Image from "next/image";

export default function Register() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (password !== confirm) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setErro("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const resposta = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao criar conta");
      }

      setSucesso(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      setErro(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── PAINEL ESQUERDO: Branding (idêntico ao login) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-creative-dark relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-white/70 text-sm font-medium">
              Acesso Restrito — Somente Líderes
            </span>
          </div>

          <h1 className="text-white text-5xl font-black leading-tight tracking-tighter mb-6">
            Crie sua conta <br />
            <span className="text-blue-400">de Liderança</span> <br />
            no sistema.
          </h1>
          <p className="text-creative-text text-lg max-w-md leading-relaxed">
            Líderes e administradores têm acesso completo para gerenciar
            voluntários, escalas e departamentos.
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
              style={{ height: "auto" }}
              priority
            />
          </div>

          {/* Cabeçalho */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Criar conta de líder
            </h2>
            <p className="text-slate-500 mt-2">
              Preencha os dados para criar sua conta de acesso
            </p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            {sucesso ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheck size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Conta criada com sucesso!
                </h3>
                <p className="text-slate-500 text-sm">
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Nome completo
                  </label>
                  <input
                    id="reg-nome"
                    type="text"
                    placeholder="João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    required
                    autoComplete="name"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    E-mail
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="exemplo@igreja.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mensagem de erro */}
                {erro && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{erro}</span>
                  </div>
                )}

                {/* Botão */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-creative-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-slate-900 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta de Líder
                      <UserPlus size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-slate-500 text-sm">
            Já tem conta?{" "}
            <a
              href="/login"
              className="font-bold text-slate-900 hover:underline"
            >
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
