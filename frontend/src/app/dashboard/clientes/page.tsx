'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { maskCep, maskCpf, maskCurrency, maskPhone, maskRg, parseCurrency } from '@/lib/masks';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';

// Aplica máscara no valor do input sem usar estado do React (input não-controlado).
const maskInPlace = (mask: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
  e.target.value = mask(e.target.value);
};
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

type ClientType = 'COMPRADOR' | 'LOCATARIO' | 'LOCADOR' | 'INTERESSADO';
type ActiveTab = ClientType;

const SPOUSE_REQUIRED_STATUSES = ['Casado(a)', 'União Estável'];

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
  spouseName?: string;
  spouseCpf?: string;
  spouseRg?: string;
  spousePhone?: string;
  spouseAddress?: string;
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
    retry: false,
  });

  const ownersQuery = useQuery({
    queryKey: ['clients', 'owners', search],
    queryFn: () => api.get<Owner[]>(`/clients/owners?search=${encodeURIComponent(search)}`),
    enabled: activeTab === 'LOCADOR',
    retry: false,
  });

  // Na aba Locadores, combina Clients tipo=LOCADOR + proprietários de Property (fonte "owner do imóvel")
  const items: Person[] = activeTab === 'LOCADOR'
    ? [...(clientsQuery.data ?? []), ...(ownersQuery.data ?? [])]
    : (clientsQuery.data ?? []);
  const loading = activeTab === 'LOCADOR'
    ? clientsQuery.isLoading || ownersQuery.isLoading
    : clientsQuery.isLoading;
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
      toast.success(editingClient ? 'Cadastro atualizado' : 'Cadastro criado com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar cadastro.');
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Deseja excluir ${client.name}?`)) return;
    try {
      await api.del(`/clients/${client.id}`);
      refresh();
      setSelectedPerson(null);
      toast.success(`${client.name} foi excluído`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir cadastro.');
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
  // Campos são não-controlados (valor no navegador) — digitar não re-renderiza nada.
  const [clientType, setClientType] = useState<ClientType>(initialData?.clientType || defaultType);
  const [spouseVisible, setSpouseVisible] = useState<boolean>(
    initialData?.civilStatus ? SPOUSE_REQUIRED_STATUSES.includes(initialData.civilStatus) : false,
  );

  useLockBodyScroll(isOpen);

  // Reinicia clientType + visibilidade do cônjuge a cada abertura (componente não desmonta ao fechar).
  useEffect(() => {
    if (!isOpen) return;
    setClientType(initialData?.clientType || defaultType);
    setSpouseVisible(
      initialData?.civilStatus ? SPOUSE_REQUIRED_STATUSES.includes(initialData.civilStatus) : false,
    );
  }, [isOpen, initialData, defaultType]);

  if (!isOpen) return null;

  const d = {
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    cpf: initialData?.cpf ?? '',
    rg: initialData?.rg ?? '',
    civilStatus: initialData?.civilStatus ?? '',
    profession: initialData?.profession ?? '',
    income: initialData?.income ? maskCurrency(initialData.income) : '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? 'SP',
    zipCode: initialData?.zipCode ?? '',
    preferences: initialData?.preferences ?? '',
    notes: initialData?.notes ?? '',
    spouseName: initialData?.spouseName ?? '',
    spouseCpf: initialData?.spouseCpf ?? '',
    spouseRg: initialData?.spouseRg ?? '',
    spousePhone: initialData?.spousePhone ?? '',
    spouseAddress: initialData?.spouseAddress ?? '',
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => ((fd.get(k) as string | null) ?? '').trim();
    const civilStatus = get('civilStatus');
    const spouseOn = SPOUSE_REQUIRED_STATUSES.includes(civilStatus);
    const phone = get('phone');

    onSave({
      clientType,
      name: get('name'),
      email: get('email') || null,
      phone,
      whatsapp: phone,
      cpf: get('cpf') || null,
      rg: get('rg') || null,
      civilStatus,
      profession: get('profession'),
      income: parseCurrency(get('income')).number,
      address: get('address'),
      city: get('city'),
      state: get('state'),
      zipCode: get('zipCode'),
      preferences: get('preferences'),
      notes: get('notes'),
      spouseName: spouseOn ? get('spouseName') || null : null,
      spouseCpf: spouseOn ? get('spouseCpf') || null : null,
      spouseRg: spouseOn ? get('spouseRg') || null : null,
      spousePhone: spouseOn ? get('spousePhone') || null : null,
      spouseAddress: spouseOn ? get('spouseAddress') || null : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70" onClick={onClose}>
      <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['COMPRADOR', 'LOCATARIO', 'LOCADOR', 'INTERESSADO'] as ClientType[]).map((type) => (
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
                <input type="text" name="name" required defaultValue={d.name} placeholder="Ex: Joao Pedro de Oliveira" className="modal-input" />
              </ModalField>
              <ModalField label="E-mail">
                <input type="email" name="email" defaultValue={d.email} placeholder="exemplo@email.com" className="modal-input" />
              </ModalField>
              <ModalField label="CPF">
                <input type="text" name="cpf" defaultValue={d.cpf} onChange={maskInPlace(maskCpf)} placeholder="000.000.000-00" className="modal-input" inputMode="numeric" />
              </ModalField>
              <ModalField label="RG">
                <input type="text" name="rg" defaultValue={d.rg} onChange={maskInPlace(maskRg)} placeholder="00.000.000-0" className="modal-input" inputMode="numeric" />
              </ModalField>
              <ModalField label="Telefone / WhatsApp">
                <input type="tel" name="phone" required defaultValue={d.phone} onChange={maskInPlace(maskPhone)} placeholder="(11) 99999-9999" className="modal-input" inputMode="numeric" />
              </ModalField>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Perfil financeiro</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModalField label="Profissao">
                <input type="text" name="profession" defaultValue={d.profession} placeholder="Ex: Engenheiro" className="modal-input" />
              </ModalField>
              <ModalField label="Estado civil">
                <select
                  name="civilStatus"
                  defaultValue={d.civilStatus}
                  onChange={(e) => setSpouseVisible(SPOUSE_REQUIRED_STATUSES.includes(e.target.value))}
                  className="modal-input"
                >
                  <option value="">Selecionar</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viuvo(a)">Viúvo(a)</option>
                </select>
              </ModalField>
              <ModalField label="Renda mensal">
                <input type="text" name="income" defaultValue={d.income} onChange={maskInPlace(maskCurrency)} placeholder="R$ 0,00" className="modal-input font-semibold text-primary" inputMode="numeric" />
              </ModalField>
            </div>
          </section>

          {spouseVisible && (
            <section className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Dados do Cônjuge
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModalField label="Nome completo do cônjuge">
                  <input type="text" name="spouseName" defaultValue={d.spouseName} placeholder="Nome completo" className="modal-input" />
                </ModalField>
                <ModalField label="Telefone do cônjuge">
                  <input type="tel" name="spousePhone" defaultValue={d.spousePhone} onChange={maskInPlace(maskPhone)} placeholder="(11) 99999-9999" className="modal-input" inputMode="numeric" />
                </ModalField>
                <ModalField label="CPF do cônjuge">
                  <input type="text" name="spouseCpf" defaultValue={d.spouseCpf} onChange={maskInPlace(maskCpf)} placeholder="000.000.000-00" className="modal-input" inputMode="numeric" />
                </ModalField>
                <ModalField label="RG do cônjuge">
                  <input type="text" name="spouseRg" defaultValue={d.spouseRg} onChange={maskInPlace(maskRg)} placeholder="00.000.000-0" className="modal-input" inputMode="numeric" />
                </ModalField>
                <ModalField label="Endereço do cônjuge (onde mora)" className="md:col-span-2">
                  <input type="text" name="spouseAddress" defaultValue={d.spouseAddress} placeholder="Rua, número, bairro, cidade" className="modal-input" />
                </ModalField>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Endereco</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ModalField label="Endereco" className="md:col-span-2">
                <input type="text" name="address" defaultValue={d.address} placeholder="Rua, numero, complemento" className="modal-input" />
              </ModalField>
              <ModalField label="Cidade">
                <input type="text" name="city" defaultValue={d.city} placeholder="Cidade" className="modal-input" />
              </ModalField>
              <ModalField label="UF">
                <input type="text" name="state" defaultValue={d.state} placeholder="SP" className="modal-input" />
              </ModalField>
              <ModalField label="CEP" className="md:col-span-2">
                <input type="text" name="zipCode" defaultValue={d.zipCode} onChange={maskInPlace(maskCep)} placeholder="00000-000" className="modal-input" inputMode="numeric" />
              </ModalField>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Interesse imobiliario</h4>
            <ModalField label="Preferencias de imoveis">
              <input type="text" name="preferences" defaultValue={d.preferences} placeholder="Ex: apartamento, 3 quartos, Pinheiros" className="modal-input" />
            </ModalField>
            <ModalField label="Observacoes">
              <textarea rows={3} name="notes" defaultValue={d.notes} placeholder="Notas gerais sobre o cadastro..." className="modal-input resize-y" />
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
