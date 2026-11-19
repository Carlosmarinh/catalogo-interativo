import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Play,
} from 'lucide-react';
import {
  DEMO_TEST_EMAIL,
  DEMO_TEST_PASSWORD,
  useAuth,
} from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const { isAuthenticated, signIn, signUp, loginDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/admin/painel" replace />;
  }

  const handleFillDemoCredentials = () => {
    setMode('login');
    setEmail(DEMO_TEST_EMAIL);
    setPassword(DEMO_TEST_PASSWORD);
    setError(null);
    setInfoMessage(
      'Credenciais de teste preenchidas! Clique em "Entrar no Painel" abaixo para acessar.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.error) setError(res.error);
      } else {
        const res = await signUp(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          setInfoMessage(
            'Conta criada! Verifique seu e-mail caso a confirmação esteja habilitada no Supabase ou faça login.'
          );
          setMode('login');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center p-4">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Vitrine Pública
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-orange-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Painel do Lojista
              </h1>
              <p className="text-xs text-slate-400">
                Gerencie produtos, preços, disponibilidade e WhatsApp
              </p>
            </div>
          </div>

          {/* Card Modo Demonstração / Portfólio para Recrutadores e Clientes */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 border border-orange-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-orange-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Modo Demonstração / Portfólio
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                Acesso Livre
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Visitante ou recrutador? Preencha as credenciais de teste ou entre direto com 1 clique para explorar o CRUD de produtos, duplicação e gestão de pedidos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Preencher credenciais de teste</span>
              </button>

              <button
                type="button"
                onClick={loginDemo}
                className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Entrar com 1 Clique</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Login do Estabelecimento
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail do Lojista
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lojista@suaempresa.com.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              {submitting
                ? 'Autenticando...'
                : mode === 'login'
                ? 'Entrar no Painel'
                : 'Criar Conta de Lojista'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>
              Status Supabase:{' '}
              <strong className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                {isSupabaseConfigured ? 'Conectado (.env)' : 'Modo Local'}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
            >
              {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
