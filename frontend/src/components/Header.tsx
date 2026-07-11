'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Menu, X, Landmark, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/imoveis', label: 'Imóveis' },
    { href: '/simulador', label: 'Simulador' },
    { href: '/blog', label: 'Blog' },
    { href: '/contato', label: 'Contato' },
  ];

  const isActive = (path: string) => pathname === path;

  // Reverting to the original "Glassy" header style
  const headerBg = scrolled 
    ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b shadow-sm' 
    : isHomePage ? 'bg-transparent border-transparent' : 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b shadow-sm';
  
  const textColor = isHomePage && !scrolled ? 'text-white' : 'text-neutral-900 dark:text-white';

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Fabelle Imobiliária Logo */}
          <Link href="/" className="flex items-center gap-2 group py-1">
            <img 
              src="https://cdn2.uso.com.br/sites/logos/916776.png" 
              alt="Fabelle Imobiliária" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold transition-colors hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : textColor
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg border hover:bg-secondary transition-colors ${textColor} border-current opacity-60 hover:opacity-100`}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <Link
                href="/dashboard/overview"
                className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Painel CRM
              </Link>
            ) : (
              <Link
                href="/login"
                className={`border border-primary text-primary hover:bg-primary hover:text-white font-bold px-5 py-2.5 rounded-lg transition-all`}
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg border transition-all ${textColor} border-current`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t py-6 px-6 absolute top-full left-0 w-full shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-bold text-lg py-2 ${
                isActive(link.href) ? 'text-primary' : 'text-neutral-900 dark:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-border my-2" />
          {user ? (
            <Link
              href="/dashboard/overview"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-white text-center font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-5 w-5" />
              Painel CRM
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="border border-primary text-primary text-center font-bold py-3 rounded-lg hover:bg-primary hover:text-white"
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
