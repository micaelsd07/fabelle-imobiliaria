'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  X,
  FileText,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

interface Visit {
  id: string;
  dateTime: string;
  status: string; // AGENDADA, CONFIRMADA, REALIZADA, CANCELADA
  notes?: string;
  broker: { id: string; name: string; phone?: string };
  client: { id: string; name: string; phone?: string };
  property: { id: string; code: string; title: string; address: string };
}

const MOCK_VISITS: Visit[] = (() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return [{
    id: '1',
    dateTime: tomorrow.toISOString(),
    status: 'AGENDADA',
    notes: 'Cliente quer levar arquiteto para avaliar planta.',
    broker: { id: 'b1', name: 'Rodrigo Silva', phone: '(11) 98888-3333' },
    client: { id: 'c1', name: 'João Pedro de Oliveira', phone: '(11) 98111-2222' },
    property: { id: 'p1', code: 'FAB-001', title: 'Cobertura Duplex nos Jardins', address: 'Alameda Lorena, 1500' },
  }];
})();

export default function DashboardAgenda() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const visitsQuery = useQuery({ queryKey: ['agenda'], queryFn: () => api.get<Visit[]>('/agenda'), retry: false });
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: () => api.get<any[]>('/users'), retry: false });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: () => api.get<any[]>('/clients'), retry: false });
  const propertiesQuery = useQuery({ queryKey: ['properties'], queryFn: () => api.get<any[]>('/properties'), retry: false });

  const visits: Visit[] = visitsQuery.data ?? [];
  const loading = visitsQuery.isLoading;

  const brokers: Array<{ id: string; name: string }> = (usersQuery.data ?? []).filter((x: any) => x.role === 'CORRETOR');
  const clients: Array<{ id: string; name: string }> = clientsQuery.data ?? [];
  const properties: Array<{ id: string; code: string; title: string }> =
    (propertiesQuery.data ?? []).filter((x: any) => x.status === 'DISPONIVEL');

  const [modalOpen, setModalOpen] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [brokerId, setBrokerId] = useState('');
  const [clientId, setClientId] = useState('');
  const [propertyId, setPropertyId] = useState('');

  useLockBodyScroll(modalOpen);

  const handleOpenCreate = () => {
    setDateTime('');
    setNotes('');
    setBrokerId('');
    setClientId('');
    setPropertyId('');
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { dateTime, notes, brokerId: brokerId || user?.id, clientId, propertyId };
    try {
      await api.post('/agenda', payload);
      qc.invalidateQueries({ queryKey: ['agenda'] });
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
    setModalOpen(false);
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await api.put(`/agenda/${id}`, { status: nextStatus });
      qc.invalidateQueries({ queryKey: ['agenda'] });
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
  };

  const formatVisitDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
  };

  const formatVisitTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Agenda de Visitas</h1>
          <p className="text-sm text-muted-foreground font-semibold">Agende visitas, acompanhe confirmações e envie lembretes.</p>
        </div>
        <button
          onClick={() => {
            handleOpenCreate();
            setModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Agendar Visita
        </button>
      </div>

      {/* Grid Visitas cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-card border rounded-2xl py-16 text-center text-muted-foreground text-sm font-semibold">
          Nenhuma visita agendada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-card border rounded-2xl p-5 shadow-xs flex flex-col gap-4 relative border-t-4 border-t-primary"
            >
              {/* Date time badge */}
              <div className="flex justify-between items-center bg-secondary/40 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CalendarIcon className="h-4.5 w-4.5 text-primary" />
                  <span className="capitalize">{formatVisitDate(visit.dateTime)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-primary">
                  <Clock className="h-4 w-4" />
                  {formatVisitTime(visit.dateTime)}
                </div>
              </div>

              {/* Property details */}
              <div className="space-y-1">
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black">
                  {visit.property.code}
                </span>
                <h4 className="font-extrabold text-sm text-foreground line-clamp-1">{visit.property.title}</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  {visit.property.address}
                </p>
              </div>

              {/* People */}
              <div className="grid grid-cols-2 gap-4 border-y py-3 text-xs font-semibold text-foreground/80">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-muted-foreground font-medium block uppercase">Cliente</span>
                  <div className="flex items-center gap-1 truncate">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{visit.client.name}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-muted-foreground font-medium block uppercase">Corretor</span>
                  <div className="flex items-center gap-1 truncate text-muted-foreground">
                    <span className="truncate">{visit.broker.name}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {visit.notes && (
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{visit.notes}"
                </p>
              )}

              {/* Status and quick update */}
              <div className="flex justify-between items-center mt-auto pt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                  visit.status === 'AGENDADA' ? 'bg-primary/10 text-primary border-primary/20' :
                  visit.status === 'CONFIRMADA' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  visit.status === 'REALIZADA' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {visit.status}
                </span>

                <div className="flex gap-1.5">
                  {visit.status === 'AGENDADA' && (
                    <button
                      onClick={() => handleUpdateStatus(visit.id, 'CONFIRMADA')}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {visit.status === 'CONFIRMADA' && (
                    <button
                      onClick={() => handleUpdateStatus(visit.id, 'REALIZADA')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Concluída
                    </button>
                  )}
                  {visit.status !== 'REALIZADA' && visit.status !== 'CANCELADA' && (
                    <button
                      onClick={() => handleUpdateStatus(visit.id, 'CANCELADA')}
                      className="border border-red-500/30 hover:bg-red-500/10 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agenda Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in scale-in duration-300">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" /> Agendar Visita
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 border rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="space-y-4 text-xs font-semibold">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Data & Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground"
                />
              </div>

              {/* Property Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Imóvel</label>
                <select
                  required
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                >
                  <option value="">Selecione o Imóvel</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Cliente Interessado</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                >
                  <option value="">Selecione o Cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Broker Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Corretor Responsável</label>
                <select
                  value={brokerId}
                  onChange={(e) => setBrokerId(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                >
                  <option value="">Atribuído a mim ({user?.name})</option>
                  {brokers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Instruções / Notas da Visita</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Levar chaves adicionais da garagem..."
                  className="w-full bg-secondary/40 border px-3 py-2 rounded-lg outline-none text-foreground font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border px-4 py-2 rounded-xl hover:bg-secondary cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer"
                >
                  Agendar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

