import React from 'react';
import Link from 'next/link';
import { Landmark, Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="https://cdn2.uso.com.br/sites/logos/916776.png" 
                alt="Fabelle Imobiliária" 
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Negócios imobiliários de alto padrão com transparência, segurança jurídica e atendimento excepcional em Jacareí e região.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/fabelleimobiliaria" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors text-neutral-400">
                <Instagram className="h-5 w-5" />
              </a>
              <Link href="#" className="hover:text-primary transition-colors text-neutral-400">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors text-neutral-400">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Início</Link>
              </li>
              <li>
                <Link href="/imoveis" className="hover:text-primary transition-colors">Catálogo de Imóveis</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">Artigos & Blog</Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-primary transition-colors">Fale Conosco</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/imoveis?category=APARTAMENTO" className="hover:text-primary transition-colors">Apartamentos</Link>
              </li>
              <li>
                <Link href="/imoveis?category=COBERTURA" className="hover:text-primary transition-colors">Coberturas Duplex</Link>
              </li>
              <li>
                <Link href="/imoveis?category=CASA" className="hover:text-primary transition-colors">Casas de Condomínio</Link>
              </li>
              <li>
                <Link href="/imoveis?category=SALA_COMERCIAL" className="hover:text-primary transition-colors">Salas Comerciais</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Fabelle Corp</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>R. Barão de Jacareí, 985 - Centro<br />Jacareí - SP, CEP 12308-000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>(12) 99784-8803</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>fabelleimobiliaria@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-neutral-900 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Fabelle Imobiliária Ltda. Todos os direitos reservados. CRECI 29.197-J.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-neutral-400 transition-colors">Políticas de Privacidade</Link>
            <Link href="#" className="hover:text-neutral-400 transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
