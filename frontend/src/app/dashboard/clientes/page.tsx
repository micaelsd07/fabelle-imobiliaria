'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Briefcase,
  Compass,
  DollarSign,
  FileSignature,
  Home,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';

type ClientType = 'COMPRADOR' | 'LOCATARIO' | 'INTERESSADO';
type ActiveTab = ClientType | 'LOCADOR';

interface Client {
  id: string;
  clientType?: ClientType;
  name: string;
  cpf?: string;
  rg?: string;
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

interface Owner {
  id: string;
  clientType: 'LOCADOR';
  name: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  civilStatus?: string;
  profession?: string;
  address?: string;
  spouseName?: string;
  spouseCpf?: string;
  spousePhone?: string;
  createdAt: string;
  properties: Array<{ id: string; code: string; title: string; status: string; type: string }>;
}

type Person = Client | Owner;

const tabs: Array<{ id: ActiveTab; label: string; description: string }> = [
  { id: 'COMPRADOR', label: 'Compradores', description: 'Clientes que procuram comprar imoveis.' },
  { id: 'LOCATARIO', label: 'Locatarios', description: 'Clientes que procuram alugar imoveis.' },
  { id: 'LOCADOR', label: 'Locadores', description: 'Proprietarios vinculados aos imoveis cadastrados.' },
  { id: 'INTERESSADO', label: 'Interessados', description: 'Contatos em qualificacao comercial.' },
];

const typeLabels: Record<ActiveTab, string> = {
  COMPRADOR: 'Comprador',
  LOCATARIO: 'Locatario',
  LOCADOR: 'Locador',
  INTERESSADO: 'Interessado',
};

function isOwner(person: Person | null): person is Owner {
  return !!person && person.clientType === 'LOCADOR';
}

export default function DashboardClients() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('COMPRADOR');
  const [search, setSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const clientsQuery = useQuery({
    queryKey: ['clients', activeTab, search],
    queryFn: () => api.get<Client[]>(`/clients?type=${activeTab}&search=${encodeURIComponent(search)}`),
    enabled: activeTab !== 'LOCADOR',
    retry: false,
  });

  const ownersQuery = useQuery({
    queryKey: ['clients', 'owners', search],
    queryFn: () => api.get<Owner[]>(`/clients/owners?search=${encodeURIComponent(search)}`),
    enabled: activeTab === 'LOCADOR',
    retry: false,
  });

  const items: Person[] = activeTab === 'LOCADOR' ? ownersQuery.data ?? [] : clientsQuery.data ?? [];
  const loading = activeTab === 'LOCADOR' ? ownersQuery.isLoading : clientsQuery.isLoading;
  const activeMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const counts = useMemo(() => {
    const clientRows = clientsQuery.data ?? [];
    return {
      current: items.length,
      label: typeLabels[activeTab],
      loadedClients: clientRows.length,
    };
  }, [activeTab, clientsQuery.data, items.length]);

  useEffect(() => {
    setSelectedPerson(null);
  }, [activeTab]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['clients'] });
  };

  const openCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const viewClientDetails = async (person: Person) => {
    if (isOwner(person)) {
      setSelectedPerson(person);
      return;
    }

    try {
      const full = await api.get<Client>(`/clients/${person.id}`);
      setSelectedPerson(full);
    } catch {
      setSelectedPerson(person);
    }
  };

  const handleSave = async (payload: any) => {
    try {
      const saved = editingClient
        ? await api.put<Client>(`/clients/${editingClient.id}`, payload)
        : await api.post<Client>('/clients', payload);
      refresh();
      setSelectedPerson(saved);
      setModalOpen(false);
      setEditingClient(null);
      setActiveTab(saved.clientType ?? 'COMPRADOR');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar cadastro.');
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Deseja excluir ${client.name}?`)) return;
    try {
      await api.del(`/clients/${client.id}`);
      refresh();
      setSelectedPerson(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir cadastro.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Clientes CRM</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Cadastros separados por compradores, locatarios, locadores e interessados.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Cadastrar Pessoa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`text-left border rounded-2xl p-4 transition-colors cursor-pointer ${
              activeTab === tab.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-card hover:bg-secondary/40 text-foreground'
            }`}
          >
            <span className="text-sm font-black block">{tab.label}</span>
            <span className={`text-[11px] font-semibold ${activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground'}`}>
              {tab.description}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Buscar em ${activeMeta.label.toLowerCase()} por nome, e-mail, CPF ou telefone...`}
                className="w-full bg-card border pl-11 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/45 text-foreground text-sm shadow-xs"
              />
            </div>
            <div className="bg-card border rounded-xl px-4 py-3 text-xs font-bold text-muted-foreground">
              {counts.current} {counts.current === 1 ? counts.label : activeMeta.label}
            </div>
          </div>

          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm font-semibold">
                Nenhum registro encontrado em {activeMeta.label.toLowerCase()}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b bg-secondary/35 text-muted-foreground uppercase tracking-wider font-bold">
                      <th className="p-4">Nome</th>
                      <th className="p-4">CPF / Contato</th>
                      <th className="p-4">Perfil</th>
                      <th className="p-4">Cadastrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y cursor-pointer">
                    {items.map((person) => (
                      <tr
                        key={person.id}
                        onClick={() => viewClientDetails(person)}
                        className={`transition-colors ${
                          selectedPerson?.id === person.id ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/15'
                        }`}
                      >
                        <td className="p-4">
                          <span className="font-extrabold text-sm text-foreground block">{person.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{person.email || 'Sem e-mail'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-foreground block">{person.cpf || 'Sem CPF'}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{person.phone || 'Sem telefone'}</span>
                        </td>
                        <td className="p-4 text-foreground/80">
                          {isOwner(person) ? `${person.properties.length} imovel(is)` : person.profession || typeLabels[person.clientType ?? 'COMPRADOR']}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(person.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <PersonDetails
          person={selectedPerson}
          activeTab={activeTab}
          onEdit={(client) => openEdit(client)}
          onDelete={(client) => handleDeleteClient(client)}
        />
      </div>

      <ClientModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSave}
        initialData={editingClient}
        defaultType={activeTab === 'LOCADOR' ? 'COMPRADOR' : activeTab}
      />
    </div>
  );
}

function PersonDetails({
  person,
  activeTab,
  onEdit,
  onDelete,
}: {
  person: Person | null;
  activeTab: ActiveTab;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}) {
  if (!person) {
    return (
      <div className="bg-card border rounded-2xl p-6 shadow-sm text-center py-12 text-muted-foreground text-sm font-semibold">
        Selecione um registro em {typeLabels[activeTab].toLowerCase()} para ver a ficha completa.
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="h-12 w-12 bg-primary/15 text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
          {isOwner(person) ? <Home className="h-5 w-5" /> : person.name[0]}
        </div>
        <div>
          <h3 className="font-extrabold text-base text-foreground leading-tight">{person.name}</h3>
          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-black text-muted-foreground uppercase tracking-wide">
            {typeLabels[person.clientType ?? 'COMPRADOR']}
          </span>
        </div>
      </div>

      {!isOwner(person) && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onEdit(person)} className="border px-3 py-2 rounded-xl hover:bg-secondary text-xs font-bold cursor-pointer">
            Editar ficha
          </button>
          <button type="button" onClick={() => onDelete(person)} className="border border-red-500/30 text-red-500 px-3 py-2 rounded-xl hover:bg-red-500/10 text-xs font-bold cursor-pointer">
            Excluir
          </button>
        </div>
      )}

      <div className="space-y-3.5 text-xs font-semibold text-foreground/80">
        <InfoLine icon={<Mail className="h-4 w-4 text-primary" />} value={person.email || 'Nao informado'} />
        <InfoLine icon={<Phone className="h-4 w-4 text-primary" />} value={person.phone || 'Nao informado'} />
        <InfoLine icon={<Briefcase className="h-4 w-4 text-primary" />} value={person.profession || 'Profissao nao informada'} />
        {!isOwner(person) && <InfoLine icon={<DollarSign className="h-4 w-4 text-primary" />} value={`R$ ${person.income?.toLocaleString('pt-BR') || '0,00'} de renda`} />}
      </div>

      {person.address && (
        <Block title="Endereco">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{person.address}</p>
        </Block>
      )}

      {!isOwner(person) && person.preferences && (
        <Block title="Preferencias de imoveis">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{person.preferences}</p>
        </Block>
      )}

      {!isOwner(person) && person.notes && (
        <Block title="Observacoes do corretor">
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">&quot;{person.notes}&quot;</p>
        </Block>
      )}

      {isOwner(person) ? (
        <Block title="Imoveis do locador">
          <div className="space-y-2">
            {person.properties.map((property) => (
              <div key={property.id} className="p-3 border rounded-xl bg-secondary/15 text-xs">
                <span className="font-extrabold text-foreground block">{property.code} - {property.title}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">{property.type} / {property.status}</span>
              </div>
            ))}
          </div>
        </Block>
      ) : (
        <Block title="Contratos vinculados" icon={<FileSignature className="h-4 w-4 text-primary" />}>
          {person.contracts && person.contracts.length > 0 ? (
            <div className="space-y-2">
              {person.contracts.map((contract) => (
                <div key={contract.id} className="p-3 border rounded-xl bg-secondary/15 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-foreground block">{contract.title}</span>
                    <span className="text-[9px] text-muted-foreground font-medium uppercase">{contract.type} - {contract.property.code}</span>
                  </div>
                  <span className="font-black text-primary">
                    {contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground font-medium block italic">Nenhum contrato ativo.</span>
          )}
        </Block>
      )}
    </div>
  );
}

function ClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  initialData?: Client | null;
  defaultType: ClientType;
}) {
  const [clientType, setClientType] = useState<ClientType>(defaultType);
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
    setClientType(initialData?.clientType || defaultType);
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
  }, [isOpen, initialData, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clientType,
      name,
      email: email || null,
      phone,
      whatsapp: phone,
      cpf: cpf || null,
      civilStatus,
      profession,
      income: parseFloat(income.toString()) || 0,
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
            <Compass className="h-5 w-5 text-primary" /> {initialData ? 'Editar Cadastro' : 'Cadastrar Pessoa'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 border rounded-lg hover:bg-secondary cursor-pointer" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 text-xs font-semibold">
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Classificacao</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['COMPRADOR', 'LOCATARIO', 'INTERESSADO'] as ClientType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setClientType(type)}
                  className={`border rounded-xl px-4 py-3 text-left font-black cursor-pointer ${
                    clientType === type ? 'bg-primary text-white border-primary' : 'bg-secondary/20 hover:bg-secondary'
                  }`}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Identificacao</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModalField label="Nome completo">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Joao Pedro de Oliveira" className="modal-input" />
              </ModalField>
              <ModalField label="E-mail">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" className="modal-input" />
              </ModalField>
              <ModalField label="CPF">
                <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="modal-input" />
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
              <input type="text" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Ex: apartamento, 3 quartos, Pinheiros" className="modal-input" />
            </ModalField>
            <ModalField label="Observacoes">
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas gerais sobre o cadastro..." className="modal-input resize-y" />
            </ModalField>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded-xl hover:bg-secondary cursor-pointer">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer">
              {initialData ? 'Salvar Alteracoes' : 'Criar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t pt-4">
      <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wide flex items-center gap-1">
        {icon}
        {title}
      </h4>
      {children}
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
