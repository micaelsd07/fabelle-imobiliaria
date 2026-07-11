'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Landmark, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao tentar realizar o login. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-12 px-4">
      {/* Background aesthetics */}
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
        {/* Title / Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center py-1">
            <img 
              src="https://cdn2.uso.com.br/sites/logos/916776.png" 
              alt="Fabelle Imobiliária" 
              className="h-14 w-auto object-contain"
            />
          </Link>
          <h2 className="text-xl font-bold text-white">Acesse sua conta</h2>
          <p className="text-xs text-white/75 font-medium">Use suas credenciais de imobiliária para entrar no painel</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/25 text-destructive p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wide">E-mail corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 h-4.5 w-4.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: corretor@fabelle.com.br"
                className="w-full bg-black/55 border border-white/25 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/45 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-white uppercase tracking-wide">Senha</label>
              <Link href="/recuperar" className="text-xs font-semibold text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 h-4.5 w-4.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-black/55 border border-white/25 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/45 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar no Sistema'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <hr className="border-border" />

        <div className="text-center text-xs text-white/75 font-medium flex flex-col gap-2">
          <div>
            Ainda não tem acesso?{' '}
            <Link href="/cadastro" className="text-primary font-bold hover:underline">
              Solicitar cadastro
            </Link>
          </div>
          <Link href="/" className="text-xs text-white/75 hover:text-primary font-semibold mt-1 transition-colors">
            ← Voltar para o site institucional
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
