'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useDuplicateProperty,
  useArchiveProperty,
} from '@/lib/queries';
import type { Property } from './components/types';
import { PropertyFilters, type Filters } from './components/PropertyFilters';
import { PropertyTable } from './components/PropertyTable';
import { PropertyForm } from './components/PropertyForm';
import { PropertyDetails } from './components/PropertyDetails';

export default function DashboardProperties() {
  const propertiesQuery = useProperties();
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const deleteMutation = useDeleteProperty();
  const duplicateMutation = useDuplicateProperty();
  const archiveMutation = useArchiveProperty();

  const [filters, setFilters] = useState<Filters>({ search: '', category: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [viewing, setViewing] = useState<Property | null>(null);

  const items = propertiesQuery.data ?? [];

  const filtered = useMemo(() => {
    let result = items;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.neighborhood.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term),
      );
    }
    if (filters.category) result = result.filter((p) => p.category === filters.category);
    if (filters.status)   result = result.filter((p) => p.status === filters.status);
    return result;
  }, [items, filters]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Property) => { setEditing(p); setModalOpen(true); };

  const handleSave = async (payload: any) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, body: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Gestão de Imóveis</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Consulte, cadastre, duplique ou edite o acervo imobiliário.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Cadastrar Imóvel
        </button>
      </div>

      <PropertyFilters value={filters} onChange={setFilters} />

      <PropertyTable
        items={filtered}
        loading={propertiesQuery.isLoading}
        onView={(p) => setViewing(p)}
        onEdit={openEdit}
        onDuplicate={(id) => duplicateMutation.mutate(id)}
        onArchive={(id) => archiveMutation.mutate(id)}
        onDelete={handleDelete}
      />

      <PropertyForm
        isOpen={modalOpen}
        property={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <PropertyDetails property={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
