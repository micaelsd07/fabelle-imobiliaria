'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDevLink(null);
    try {
      const res = await api.post<{ ok: true; devLink?: string }>('/auth/forgot-password', { email });
      setSuccess(true);
      if (res.devLink) setDevLink(res.devLink);
    } catch (err: any) {
      setError(err?.message || 'Falha ao solicitar recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
          alt="Premium Architecture background"
          className="w-full h-full object-cover filter blur-sm"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-8 sm:p-10 rounded-2xl shadow-2xl z-10 text-slate-800 dark:text-neutral-100 flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center py-1">
            <img
              src="https://cdn2.uso.com.br/sites/logos/916776.png"
              alt="Fabelle Imobiliária"
              className="h-14 w-auto object-contain"
            />
          </Link>
          <h2 className="text-xl font-bold text-foreground/80 dark:text-neutral-200">Recuperar Senha</h2>
          <p className="text-xs text-muted-foreground font-medium">Informe seu e-mail para receber as instruções de recuperação</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300">Solicitação recebida</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Se <strong>{email}</strong> estiver cadastrado, um link de redefinição foi enviado. Confira sua caixa de entrada e spam.
            </p>
            {devLink && (
              <div className="mt-3 bg-white/60 dark:bg-black/40 border border-emerald-300 dark:border-emerald-700 rounded-lg p-3 text-left">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Modo desenvolvimento</p>
                <p className="text-[11px] text-muted-foreground mt-1">SMTP não configurado. Use o link abaixo:</p>
                <Link href={devLink.replace(/^https?:\/\/[^/]+/, '')} className="text-[11px] text-primary font-bold break-all hover:underline block mt-1">
                  {devLink}
                </Link>
              </div>
            )}
            <Link
              href="/login"
              className="mt-4 bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg shadow hover:bg-primary/95 transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/25 text-destructive p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">E-mail corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: corretor@fabelle.com.br"
                  className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Solicitar Link de Redefinição'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="flex flex-col items-center gap-3 mt-2">
              <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Voltar ao login
              </Link>
              <Link href="/" className="text-xs text-muted-foreground hover:text-primary font-semibold transition-colors mt-1">
                ← Voltar para o site institucional
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
