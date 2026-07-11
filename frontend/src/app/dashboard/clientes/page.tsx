'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Users,
  Plus,
  Search,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  X,
  Compass,
  FileSignature,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  civilStatus?: string;
  profession?: string;
  income?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  preferences?: string;
  photo?: string;
  createdAt: string;
  contracts?: Array<{ id: string; title: string; type: string; value: number; status: string; property: { code: string } }>;
  visits?: Array<{ id: string; dateTime: string; status: string; property: { code: string; title: string } }>;
}

const MOCK_CLIENTS: Client[] = (() => {
  const mockClients = [
          {
            id: '1',
            name: 'JoÃ£o Pedro de Oliveira',
            cpf: '123.456.789-00',
            phone: '(11) 98111-2222',
            whatsapp: '(11) 98111-2222',
            email: 'joao.pedro@email.com',
            civilStatus: 'Casado',
            profession: 'Engenheiro de Software',
            income: 18000,
            address: 'Av. Paulista, 1000',
            city: 'SÃ£o Paulo',
            state: 'SP',
            zipCode: '01310-100',
            notes: 'Procura apartamento com 3 quartos em Pinheiros.',
            preferences: 'APARTAMENTO, 3 quartos, Pinheiros',
            createdAt: new Date().toISOString(),
            contracts: [
              { id: 'c1', title: 'LocaÃ§Ã£o Residencial Pinheiros', type: 'ALUGUEL', value: 7500, status: 'ATIVO', property: { code: 'FAB-002' } },
            ],
            visits: [],
          },
          {
            id: '2',
            name: 'Mariana Costa Rodrigues',
            cpf: '987.654.321-11',
            phone: '(11) 98222-3333',
            whatsapp: '(11) 98222-3333',
            email: 'mariana.costa@email.com',
            civilStatus: 'Solteira',
            profession: 'MÃ©dica Cardiologista',
            income: 25000,
            address: 'Rua Bela Cintra, 450',
            city: 'SÃ£o Paulo',
            state: 'SP',
            zipCode: '01415-000',
            notes: 'Interessada em coberturas ou apartamentos modernos com piscina.',
            preferences: 'COBERTURA, Piscina, Jardins',
            createdAt: new Date().toISOString(),
            contracts: [],
            visits: [],
          },
        ];
  return mockClients as Client[];
})();

export default function DashboardClients() {
  const qc = useQueryClient();
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get<Client[]>('/clients'),
    retry: false,
  });
  const clients: Client[] = clientsQuery.data ?? [];
  const loading = clientsQuery.isLoading;

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Deseja excluir o cliente ${client.name}?`)) return;
    try {
      await api.del(`/clients/${client.id}`);
      qc.invalidateQueries({ queryKey: ['clients'] });
      setSelectedClient(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir cliente.');
    }
  };

  const handleSave = async (payload: any) => {
    try {
      const saved = editingClient
        ? await api.put<Client>(`/clients/${editingClient.id}`, payload)
        : await api.post<Client>('/clients', payload);
      qc.invalidateQueries({ queryKey: ['clients'] });
      setSelectedClient(saved);
      setModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar cliente.');
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf?.includes(search),
  );

  const viewClientDetails = async (client: Client) => {
    try {
      const full = await api.get<Client>(`/clients/${client.id}`);
      setSelectedClient(full);
    } catch {
      setSelectedClient(client);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Clientes CRM</h1>
          <p className="text-sm text-muted-foreground font-semibold">Base de dados de locatÃ¡rios, compradores e proprietÃ¡rios.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Cadastrar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Table & search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por nome, e-mail ou CPF..."
              className="w-full bg-card border pl-11 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/45 text-foreground text-sm shadow-xs"
            />
          </div>

          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm font-semibold">
                Nenhum cliente cadastrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b bg-secondary/35 text-muted-foreground uppercase tracking-wider font-bold">
                      <th className="p-4">Cliente</th>
                      <th className="p-4">CPF / Contato</th>
                      <th className="p-4">ProfissÃ£o</th>
                      <th className="p-4">Cadastrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y cursor-pointer">
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        onClick={() => viewClientDetails(client)}
                        className={`transition-colors ${
                          selectedClient?.id === client.id ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/15'
                        }`}
                      >
                        <td className="p-4">
                          <span className="font-extrabold text-sm text-foreground block">{client.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{client.email || 'Sem e-mail'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-foreground block">{client.cpf || 'Sem CPF'}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{client.phone || 'Sem telefone'}</span>
                        </td>
                        <td className="p-4 text-foreground/80">{client.profession || '---'}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details panel */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          {selectedClient ? (
            <div className="space-y-6">
              {/* Header profile */}
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="h-12 w-12 bg-primary/15 text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedClient.name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground leading-tight">{selectedClient.name}</h3>
                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-black text-muted-foreground uppercase tracking-wide">
                    Cliente Fabelle
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleOpenEdit(selectedClient)} className="border px-3 py-2 rounded-xl hover:bg-secondary text-xs font-bold cursor-pointer">Editar ficha</button>
                <button type="button" onClick={() => handleDeleteClient(selectedClient)} className="border border-red-500/30 text-red-500 px-3 py-2 rounded-xl hover:bg-red-500/10 text-xs font-bold cursor-pointer">Excluir</button>
              </div>

              {/* Bio details list */}
              <div className="space-y-3.5 text-xs font-semibold text-foreground/80">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>{selectedClient.email || 'NÃ£o informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>{selectedClient.phone || 'NÃ£o informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary shrink-0" />
                  <span>{selectedClient.profession || 'ProfissÃ£o nÃ£o informada'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary shrink-0" />
                  <span> R$ {selectedClient.income?.toLocaleString('pt-BR') || '0,00'} de renda</span>
                </div>
              </div>

              {/* Preferences */}
              {selectedClient.preferences && (
                <div className="space-y-1.5 border-t pt-4">
                  <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wide">PreferÃªncias ImÃ³veis</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {selectedClient.preferences}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedClient.notes && (
                <div className="space-y-1.5 border-t pt-4">
                  <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wide">ObservaÃ§Ãµes do Corretor</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    "{selectedClient.notes}"
                  </p>
                </div>
              )}

              {/* Contracts History */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wide flex items-center gap-1">
                  <FileSignature className="h-4 w-4 text-primary" /> Contratos Vinculados
                </h4>
                {selectedClient.contracts && selectedClient.contracts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.contracts.map((c) => (
                      <div key={c.id} className="p-3 border rounded-xl bg-secondary/15 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-foreground block">{c.title}</span>
                          <span className="text-[9px] text-muted-foreground font-medium uppercase">{c.type} â€¢ {c.property.code}</span>
                        </div>
                        <span className="font-black text-primary">
                          {c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground font-medium block italic">Nenhum contrato ativo.</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
              Selecione um cliente na tabela para ver a ficha cadastral completa.
            </div>
          )}
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null); }}
        onSave={handleSave}
        initialData={editingClient}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SUBCOMPONENT MODAL                              */
/* -------------------------------------------------------------------------- */
interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  initialData?: Client | null;
}

function ClientModal({ isOpen, onClose, onSave, initialData }: ClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [profession, setProfession] = useState('');
  const [income, setIncome] = useState(0);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.name || '');
    setEmail(initialData?.email || '');
    setPhone(initialData?.phone || '');
    setCpf(initialData?.cpf || '');
    setCivilStatus(initialData?.civilStatus || '');
    setProfession(initialData?.profession || '');
    setIncome(initialData?.income || 0);
    setAddress(initialData?.address || '');
    setCity(initialData?.city || '');
    setState(initialData?.state || 'SP');
    setZipCode(initialData?.zipCode || '');
    setPreferences(initialData?.preferences || '');
    setNotes(initialData?.notes || '');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      phone,
      whatsapp: phone,
      cpf,
      civilStatus,
      profession,
      income: parseFloat(income.toString()),
      address,
      city,
      state,
      zipCode,
      preferences,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col animate-in scale-in duration-200">
        <div className="h-16 flex justify-between items-center border-b px-6 shrink-0">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" /> {initialData ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 border rounded-lg hover:bg-secondary cursor-pointer" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 text-xs font-semibold">
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Identificacao</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModalField label="Nome Completo">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Joao Pedro de Oliveira" className="modal-input" />
              </ModalField>
              <ModalField label="E-mail">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" className="modal-input" />
              </ModalField>
              <ModalField label="CPF">
                <input type="text" required value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="modal-input" />
              </ModalField>
              <ModalField label="Telefone / WhatsApp">
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="modal-input" />
              </ModalField>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Perfil financeiro</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModalField label="Profissao">
                <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Engenheiro" className="modal-input" />
              </ModalField>
              <ModalField label="Estado civil">
                <select value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)} className="modal-input">
                  <option value="">Selecionar</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viuvo(a)">Viuvo(a)</option>
                </select>
              </ModalField>
              <ModalField label="Renda mensal (BRL)">
                <input type="number" value={income} onChange={(e) => setIncome(parseFloat(e.target.value) || 0)} placeholder="Renda" className="modal-input font-semibold text-primary" />
              </ModalField>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Endereco</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ModalField label="Endereco" className="md:col-span-2">
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, numero, complemento" className="modal-input" />
              </ModalField>
              <ModalField label="Cidade">
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="modal-input" />
              </ModalField>
              <ModalField label="UF">
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" className="modal-input" />
              </ModalField>
              <ModalField label="CEP" className="md:col-span-2">
                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="00000-000" className="modal-input" />
              </ModalField>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Interesse imobiliario</h4>
            <ModalField label="Preferencias de imoveis">
              <input type="text" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Ex: APARTAMENTO, 3 quartos, Pinheiros" className="modal-input" />
            </ModalField>
            <ModalField label="Observacoes do cliente">
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas gerais sobre o cliente..." className="modal-input resize-y" />
            </ModalField>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded-xl hover:bg-secondary cursor-pointer">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer">{initialData ? 'Salvar Alteracoes' : 'Criar Cliente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-foreground/80 uppercase">{label}</label>
      {children}
    </div>
  );
}

