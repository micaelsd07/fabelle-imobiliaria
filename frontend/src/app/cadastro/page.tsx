'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Landmark, User, Mail, Lock, Phone, Clipboard, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [creci, setCreci] = useState('');
  const [role, setRole] = useState('CORRETOR');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Cadastro público foi desativado por segurança.
      // Novos usuários só podem ser criados por um ADMIN/GERENTE via
      // POST /users (autenticado). Mantido apenas como placeholder de UI.
      const res = new Response(
        JSON.stringify({ message: 'Cadastro público desativado. Solicite a criação da sua conta ao administrador.' }),
        { status: 403 }
      );
      void email; void password; void name; void role; void phone; void creci;

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao criar conta.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro na criação da conta.');
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
        className="w-full max-w-lg glass p-8 sm:p-10 rounded-2xl shadow-2xl z-10 text-slate-800 dark:text-neutral-100 flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center py-1">
            <img 
              src="https://cdn2.uso.com.br/sites/logos/916776.png" 
              alt="Fabelle Imobiliária" 
              className="h-14 w-auto object-contain"
            />
          </Link>
          <h2 className="text-xl font-bold text-foreground/80 dark:text-neutral-200">Solicitar Acesso</h2>
          <p className="text-xs text-muted-foreground font-medium">Cadastre seu perfil de corretor ou colaborador no sistema SaaS</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300">Cadastro realizado com sucesso!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Sua conta foi criada. Redirecionando para a tela de login...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-destructive/10 border border-destructive/25 text-destructive p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Amanda Souza"
                    className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: amanda@fabelle.com.br"
                    className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crie uma senha forte"
                    className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Grid phone & role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: (11) 97777-4444"
                      className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">Função / Cargo</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/70 dark:bg-black/60 border px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm appearance-none cursor-pointer"
                  >
                    <option value="CORRETOR">Corretor de Imóveis</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="GERENTE">Gerente</option>
                  </select>
                </div>
              </div>

              {/* Creci (visible only for brokers) */}
              {role === 'CORRETOR' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-bold text-foreground/80 dark:text-neutral-300 uppercase tracking-wide">Número do CRECI</label>
                  <div className="relative">
                    <Clipboard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
                    <input
                      type="text"
                      required
                      value={creci}
                      onChange={(e) => setCreci(e.target.value)}
                      placeholder="Ex: CRECI-67890F"
                      className="w-full bg-white/70 dark:bg-black/60 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Concluir Solicitação'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}

        <hr className="border-border" />

        <div className="text-center text-xs text-muted-foreground font-medium flex flex-col gap-2">
          <div>
            Já tem conta registrada?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Fazer login
            </Link>
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary font-semibold mt-1 transition-colors">
            ← Voltar para o site institucional
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
