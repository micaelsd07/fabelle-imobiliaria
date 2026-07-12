'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  User,
  History,
  Send,
  Trash2,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  source: string;
  status: string;
  notes?: string;
  createdAt: string;
  broker?: { id: string; name: string };
  history?: Array<{ id: string; type: string; content: string; createdAt: string }>;
}

const COLUMNS = [
  { id: 'NOVO', title: 'Novo Lead', color: 'border-t-primary bg-primary/5' },
  { id: 'CONTATADO', title: 'Contatado', color: 'border-t-amber-500 bg-amber-500/5' },
  { id: 'VISITA_AGENDADA', title: 'Visita Agendada', color: 'border-t-purple-500 bg-purple-500/5' },
  { id: 'PROPOSTA', title: 'Proposta', color: 'border-t-pink-500 bg-pink-500/5' },
  { id: 'NEGOCIACAO', title: 'Negociação', color: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'GANHO', title: 'Ganho / Fechado', color: 'border-t-emerald-500 bg-emerald-500/5' },
  { id: 'PERDIDO', title: 'Perdido', color: 'border-t-red-500 bg-red-500/5' },
];

const MOCK_LEADS: Lead[] = [
  {
    id: '1', name: 'Fernanda Martins', email: 'fernanda.martins@email.com', phone: '(11) 99122-3344',
    whatsapp: '(11) 99122-3344', source: 'SITE', status: 'NOVO', notes: 'Interesse no duplex nos Jardins.',
    createdAt: new Date().toISOString(), broker: { id: 'b1', name: 'Rodrigo Silva' },
    history: [{ id: 'h1', type: 'STATUS_CHANGE', content: 'Lead capturado automaticamente via site.', createdAt: new Date().toISOString() }],
  },
  {
    id: '2', name: 'Gabriel Albuquerque', email: 'gabriel.albu@email.com', phone: '(11) 99233-4455',
    whatsapp: '(11) 99233-4455', source: 'GOOGLE', status: 'CONTATADO', notes: 'Demonstrou interesse no aluguel em Pinheiros.',
    createdAt: new Date().toISOString(), broker: { id: 'b2', name: 'Amanda Souza' },
    history: [{ id: 'h2', type: 'CALL', content: 'Primeira ligação realizada. Receptivo.', createdAt: new Date().toISOString() }],
  },
];

export default function DashboardLeads() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const leadsQuery = useQuery({ queryKey: ['leads'], queryFn: () => api.get<Lead[]>('/leads'), retry: false });
  const leads: Lead[] = leadsQuery.data ?? [];
  const loading = leadsQuery.isLoading;

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState('ANNOTATION');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSource, setLeadSource] = useState('SITE');
  const [leadNotes, setLeadNotes] = useState('');

  const refresh = () => qc.invalidateQueries({ queryKey: ['leads'] });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: leadName, email: leadEmail, phone: leadPhone, whatsapp: leadPhone,
      source: leadSource, notes: leadNotes, brokerId: user?.id,
    };
    try {
      await api.post('/leads', payload);
      refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
    setCreateModalOpen(false);
  };

  const moveStatus = async (leadId: string, nextStatus: string) => {
    try {
      const updated = await api.put<Lead>(`/leads/${leadId}`, { status: nextStatus });
      refresh();
      if (selectedLead?.id === leadId) setSelectedLead(updated);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja excluir este lead permanentemente?')) return;
    try {
      await api.del(`/leads/${id}`);
      refresh();
      setSelectedLead(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
  };

  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newAnnotation.trim()) return;
    const payload = { type: annotationType, content: newAnnotation };
    try {
      const entry = await api.post<any>(`/leads/${selectedLead.id}/history`, payload);
      setSelectedLead({ ...selectedLead, history: [entry, ...(selectedLead.history || [])] });
      setNewAnnotation('');
    } catch {
      const mockHistory = { id: Math.random().toString(), type: annotationType, content: newAnnotation, createdAt: new Date().toISOString() };
      setSelectedLead({ ...selectedLead, history: [mockHistory, ...(selectedLead.history || [])] });
      setNewAnnotation('');
    }
  };

  const getStatusNeighbors = (currentStatus: string) => {
    const idx = COLUMNS.findIndex((c) => c.id === currentStatus);
    return {
      prev: idx > 0 ? COLUMNS[idx - 1].id : null,
      next: idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].id : null,
    };
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Funil de Leads (CRM)</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Mapeie o fluxo comercial de atração, agendamentos de visita e propostas de fechamento.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Adicionar Lead
        </button>
      </div>

      {/* Kanban Board columns wrapper */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin select-none">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div key={col.id} className="w-80 flex-shrink-0 flex flex-col gap-4 max-h-[75vh]">
              {/* Header */}
              <div className={`p-4 border-t-4 rounded-t-xl bg-card border-x border-b flex justify-between items-center shadow-xs ${col.color}`}>
                <h3 className="font-extrabold text-sm text-foreground">{col.title}</h3>
                <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded-full font-black text-muted-foreground">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                {colLeads.map((lead) => {
                  const neighbors = getStatusNeighbors(lead.status);
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-card border rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer border-l-2 hover:border-l-primary flex flex-col gap-3 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded font-black text-muted-foreground uppercase tracking-wide">
                          {lead.source}
                        </span>
                        <h4 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {lead.name}
                        </h4>
                      </div>

                      {lead.notes && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {lead.notes}
                        </p>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t pt-2.5 mt-1 text-[10px]">
                        <span className="text-muted-foreground truncate max-w-[120px] font-semibold">
                          Resp: {lead.broker?.name || 'Livre'}
                        </span>
                        <div className="flex gap-1">
                          {neighbors.prev && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStatus(lead.id, neighbors.prev!);
                              }}
                              className="p-1 border rounded hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground"
                              title="Recuar status"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {neighbors.next && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStatus(lead.id, neighbors.next!);
                              }}
                              className="p-1 border rounded hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground"
                              title="Avançar status"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Details Modal Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border-l h-screen w-full max-w-xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-1">
                <span className="text-[9px] bg-primary/10 text-primary border px-2 py-0.5 rounded font-black uppercase">
                  CRM Detalhes do Lead
                </span>
                <h3 className="font-extrabold text-lg text-foreground mt-1.5">{selectedLead.name}</h3>
                <span className="text-xs text-muted-foreground block font-medium">Capturado via {selectedLead.source}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="p-2 border hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg cursor-pointer"
                  title="Excluir Lead"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 border rounded-lg hover:bg-secondary cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Quick Actions & Contact Details */}
            <div className="bg-secondary/35 p-4 rounded-xl border space-y-3 text-xs font-semibold">
              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-foreground/80">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{selectedLead.phone || 'Sem telefone'}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/80">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>{selectedLead.email || 'Sem e-mail'}</span>
                </div>
              </div>
              {selectedLead.notes && (
                <p className="text-muted-foreground text-xs italic font-medium">
                  Obs: {selectedLead.notes}
                </p>
              )}
            </div>

            {/* Pipeline Stage Select */}
            <div className="space-y-1.5 text-xs font-bold">
              <label className="text-foreground/80 uppercase">Estágio Atual do Funil</label>
              <select
                value={selectedLead.status}
                onChange={(e) => moveStatus(selectedLead.id, e.target.value)}
                className="w-full bg-secondary/50 border px-3 py-2 rounded-lg outline-none text-foreground cursor-pointer"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeline & Actions History */}
            <div className="flex-grow flex flex-col gap-4 overflow-hidden border-t pt-4">
              <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-primary" /> Histórico de Ligações & Observações
              </h4>

              {/* Input Logger form */}
              <form onSubmit={handleAddAnnotation} className="flex gap-2">
                <select
                  value={annotationType}
                  onChange={(e) => setAnnotationType(e.target.value)}
                  className="bg-secondary/60 border px-2 py-2 rounded-lg outline-none text-xs text-foreground cursor-pointer font-bold shrink-0"
                >
                  <option value="ANNOTATION">Nota</option>
                  <option value="CALL">Ligação</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
                <input
                  type="text"
                  required
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  placeholder="Registrar anotação ou contato..."
                  className="flex-grow bg-secondary/50 border px-3 py-2 rounded-lg outline-none text-xs text-foreground"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white p-2 rounded-lg shadow cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* History scroll list */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs">
                {selectedLead.history && selectedLead.history.length > 0 ? (
                  selectedLead.history.map((hist) => (
                    <div key={hist.id} className="p-3 border rounded-xl bg-secondary/15 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          hist.type === 'STATUS_CHANGE' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {hist.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(hist.createdAt).toLocaleDateString('pt-BR')} {new Date(hist.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-foreground/80 leading-relaxed font-semibold">
                        {hist.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground font-medium block italic text-center py-6">
                    Nenhuma anotação de contato registrada.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Lead */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in scale-in duration-300">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" /> Adicionar Lead Comercial
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 border rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Nome do Lead</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Nome do interessado"
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">E-mail</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="email@contato.com"
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Origem de Captação</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                >
                  <option value="SITE">Formulário Website</option>
                  <option value="WHATSAPP">WhatsApp Direto</option>
                  <option value="GOOGLE">Google Ads / Busca</option>
                  <option value="FACEBOOK">Facebook Ads</option>
                  <option value="INSTAGRAM">Instagram Direct</option>
                  <option value="INDICACAO">Indicação</option>
                  <option value="OUTRO">Outros canais</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Observações Iniciais</label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Mencione detalhes do interesse do cliente ou imóvel..."
                  className="w-full bg-secondary/40 border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="border px-4 py-2 rounded-xl hover:bg-secondary cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer"
                >
                  Criar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

