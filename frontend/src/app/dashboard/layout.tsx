'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Landmark,
  LayoutDashboard,
  Building2,
  Users,
  Compass,
  Calendar,
  FileSignature,
  DollarSign,
  UserCheck,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  ExternalLink,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isRoleAuthorized = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    return user && allowedRoles.includes(user.role);
  };

  const navItems = [
    { href: '/dashboard/overview', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/imoveis', label: 'Imóveis', icon: Building2 },
    { href: '/dashboard/clientes', label: 'Clientes CRM', icon: Users },
    { href: '/dashboard/leads', label: 'Funil Leads', icon: Compass },
    { href: '/dashboard/agenda', label: 'Agenda Visitas', icon: Calendar },
    { href: '/dashboard/contratos', label: 'Contratos', icon: FileSignature },
    { href: '/dashboard/financeiro', label: 'Financeiro', icon: DollarSign },
    { href: '/dashboard/usuarios', label: 'Usuários', icon: UserCheck, allowedRoles: ['ADMIN', 'GERENTE'] },
  ];

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext handles redirect
  }

  return (
    <div className="min-h-screen flex bg-secondary/30 text-foreground transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card text-card-foreground shrink-0 sticky top-0 h-screen">
        <div className="h-20 border-b flex items-center justify-center px-6">
          <Link href="/" className="flex items-center justify-center py-2">
            <img 
              src="https://cdn2.uso.com.br/sites/logos/916776.png" 
              alt="Fabelle CRM" 
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => isRoleAuthorized(item.allowedRoles))
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(item.href)
                      ? 'bg-primary text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-secondary/40 border rounded-xl">
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="h-9 w-9 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="h-9 w-9 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-sm shadow-sm">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-grow">
              <h4 className="text-sm font-extrabold text-foreground truncate">{user.name}</h4>
              <span className="text-[10px] bg-primary/10 text-primary font-black uppercase px-2 py-0.5 rounded-full border">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-20 border-b bg-card text-card-foreground flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
          {/* Mobile menu toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 border rounded-xl hover:bg-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Link href="/" className="hover:text-foreground">Website Público</Link>
              <span>/</span>
              <span className="text-foreground">Painel CRM</span>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border hover:bg-secondary text-xs font-bold text-foreground transition-all shadow-sm"
              title="Acessar site público da imobiliária"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Ver Site</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border hover:bg-secondary text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>
            <div className="h-5 w-[1px] bg-border hidden sm:block" />
            <div className="text-sm text-right hidden sm:block">
              <span className="text-muted-foreground block text-xs font-semibold">Fabelle Imobiliária</span>
              <span className="text-foreground font-extrabold">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />

          <aside className="relative flex flex-col w-64 bg-card text-card-foreground shadow-2xl z-10 border-r animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="h-20 border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-white p-2 rounded-lg">
                  <Landmark className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-lg text-foreground">Fabelle CRM</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 border rounded-xl hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Mobile */}
            <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
              {navItems
                .filter((item) => isRoleAuthorized(item.allowedRoles))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive(item.href)
                          ? 'bg-primary text-white shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
            </nav>

            {/* Logout Mobile */}
            <div className="p-4 border-t space-y-3">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Sair do Sistema
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
