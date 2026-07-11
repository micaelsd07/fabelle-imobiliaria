'use client';

import { Search } from 'lucide-react';

export interface Filters {
  search: string;
  category: string;
  status: string;
}

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
}

export function PropertyFilters({ value, onChange }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="bg-card border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-grow w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
        <input
          type="text"
          value={value.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Pesquisar por título, bairro ou código..."
          className="w-full bg-secondary/40 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
        />
      </div>

      <div className="w-full md:w-48 shrink-0">
        <select
          value={value.category}
          onChange={(e) => set('category', e.target.value)}
          className="w-full bg-secondary/40 border px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm cursor-pointer appearance-none"
        >
          <option value="">Todas Categorias</option>
          <option value="CASA">Casa</option>
          <option value="APARTAMENTO">Apartamento</option>
          <option value="COBERTURA">Cobertura</option>
          <option value="SALA_COMERCIAL">Sala Comercial</option>
          <option value="TERRENO">Terreno</option>
        </select>
      </div>

      <div className="w-full md:w-44 shrink-0">
        <select
          value={value.status}
          onChange={(e) => set('status', e.target.value)}
          className="w-full bg-secondary/40 border px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm cursor-pointer appearance-none"
        >
          <option value="">Todos Status</option>
          <option value="DISPONIVEL">Disponível</option>
          <option value="ALUGADO">Alugado</option>
          <option value="VENDIDO">Vendido</option>
          <option value="ARQUIVADO">Arquivado</option>
        </select>
      </div>
    </div>
  );
}
