'use client';

import { Archive, Copy, Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { getPropertyPhotos } from '@/components/PropertyImageCarousel';
import type { Property } from './types';

interface Props {
  items: Property[];
  loading: boolean;
  onEdit: (p: Property) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function statusClass(status: string) {
  if (status === 'DISPONIVEL') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (status === 'ARQUIVADO') return 'bg-slate-500/10 text-neutral-500 border-slate-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
}

export function PropertyTable({ items, loading, onEdit, onDuplicate, onArchive, onDelete }: Props) {
  if (loading) {
    return (
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="py-20 text-center text-muted-foreground font-semibold text-sm">
          Nenhum imóvel corresponde aos filtros da pesquisa.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold">
          <thead>
            <tr className="border-b bg-secondary/35 text-muted-foreground uppercase tracking-wider font-bold">
              <th className="p-4">Foto / Título</th>
              <th className="p-4">Código</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((prop) => (
              <tr key={prop.id} className="hover:bg-secondary/15 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  <img
                    src={getPropertyPhotos(prop)[0]}
                    alt={prop.title}
                    className="h-12 w-16 rounded-lg object-cover shadow-xs border shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-foreground block line-clamp-1">{prop.title}</span>
                    <span className="text-muted-foreground font-medium text-[10px]">
                      {prop.neighborhood}, {prop.city}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-foreground font-bold">{prop.code}</td>
                <td className="p-4 text-muted-foreground">{prop.category}</td>
                <td className="p-4 text-primary font-black text-sm">
                  {prop.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  {prop.type === 'ALUGUEL' && (
                    <span className="text-[10px] text-muted-foreground font-normal">/mês</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusClass(prop.status)}`}>
                    {prop.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <a
                      href={`/imoveis/${prop.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                      title="Ver link público"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button onClick={() => onEdit(prop)} className="p-2 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer" title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDuplicate(prop.id)} className="p-2 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer" title="Duplicar">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => onArchive(prop.id)} className="p-2 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer" title="Arquivar">
                      <Archive className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(prop.id)} className="p-2 border hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
