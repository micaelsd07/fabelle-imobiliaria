'use client';

import React from 'react';
import { Search, MapPin, Building2 } from 'lucide-react';

interface HeroProps {
  onSearch: (e: React.FormEvent) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
}

export default function Hero({
  onSearch,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#040404]">
      <div className="absolute inset-x-0 top-[20vh] select-none text-center pointer-events-none">
        <div className="text-[17vw] font-black uppercase leading-none tracking-[0.08em] text-white/[0.09] drop-shadow-[0_0_20px_rgba(225,174,20,0.16)]">
          Fabelle
        </div>
      </div>
      <div className="absolute inset-x-[10vw] top-[39vh] h-px bg-primary/55 shadow-[0_0_18px_rgba(225,174,20,0.35)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.34)_60%,rgba(0,0,0,0.78)_100%)]" />

      <div className="relative z-20 w-full max-w-7xl px-4 sm:px-8 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="w-full max-w-2xl">
          <div className="relative overflow-hidden bg-black/55 border border-white/16 p-8 md:p-12 shadow-2xl rounded-[2rem] backdrop-blur-sm">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 text-primary font-bold uppercase tracking-[0.45em] text-[10px]">
                  <div className="w-12 h-px bg-primary" />
                  Fabelle Imobiliaria
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1] tracking-tight uppercase">
                  Excelencia <span className="text-primary italic">Residencial</span>
                </h1>
                <p className="text-neutral-100 text-sm font-light leading-relaxed max-w-md mx-auto opacity-95">
                  Encontre o imovel dos seus sonhos com uma experiencia rapida, elegante e direta.
                </p>
              </div>

              <form onSubmit={onSearch} className="flex flex-col gap-6">
                <div className="flex justify-center gap-2 p-1 bg-white/10 rounded-2xl w-fit mx-auto border border-white/10">
                  {['VENDA', 'ALUGUEL'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-10 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-colors ${
                        selectedType === type ? 'bg-primary text-white shadow-lg' : 'text-white/55 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Localizacao..."
                      className="w-full bg-white/10 border-white/25 border px-12 py-5 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm text-white transition-colors placeholder:text-white/45"
                    />
                  </div>

                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-white/10 border-white/25 border px-12 py-5 rounded-2xl outline-none focus:ring-1 focus:ring-primary text-sm text-white appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-black">Tipo de Imovel</option>
                      <option value="CASA" className="bg-black">Casa Moderna</option>
                      <option value="APARTAMENTO" className="bg-black">Apartamento</option>
                      <option value="COBERTURA" className="bg-black">Cobertura</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-black py-5 px-10 rounded-2xl shadow-xl flex items-center justify-center gap-4 transition-colors text-[12px] uppercase tracking-[0.32em]"
                >
                  <Search className="h-4 w-4" />
                  Descobrir Imovel
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


