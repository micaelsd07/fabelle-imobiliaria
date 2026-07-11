'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Nova senha deve ter ao menos 6 caracteres.');
    if (password !== confirm) return setError('As senhas não coincidem.');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err?.message || 'Falha ao redefinir. Link expirado ou inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
          alt=""
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
          <h2 className="text-xl font-bold text-foreground/80 dark:text-neutral-200">Definir nova senha</h2>
          <p className="text-xs text-muted-foreground font-medium">Escolha uma senha com pelo menos 6 caracteres</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300">Senha atualizada!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Redirecionando para o login…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/25 text-destructive p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <PasswordField label="Nova senha" value={password} onChange={setPassword} />
            <PasswordField label="Confirmar senha" value={confirm} onChange={setConfirm} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Redefinir senha'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                ← Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
        <input
          type="password"
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
        />
      </div>
    </div>
  );
}
