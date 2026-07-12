'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  Clipboard,
  Trash2,
  Edit2,
  X,
  User as UserIcon,
  CheckCircle,
} from 'lucide-react';

interface UserType {
  id: string;
  email: string;
  name: string;
  role: string; // ADMIN, GERENTE, CORRETOR, RECEPCIONISTA, FINANCEIRO
  creci?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  photo?: string | null;
  commissionRate: number;
  salesMeta: number;
  active: boolean;
}

const MOCK_USERS: UserType[] = [
  { id: '1', name: 'Fabelle Admin', email: 'admin@fabelle.com.br', role: 'ADMIN', phone: '(11) 99999-1111', commissionRate: 0, salesMeta: 0, active: true },
  { id: '2', name: 'Carla Gerente', email: 'gerente@fabelle.com.br', role: 'GERENTE', phone: '(11) 99999-2222', commissionRate: 0, salesMeta: 0, active: true },
  { id: '3', name: 'Rodrigo Silva', email: 'corretor1@fabelle.com.br', role: 'CORRETOR', phone: '(11) 98888-3333', creci: 'CRECI-12345F', commissionRate: 5.0, salesMeta: 2000000, active: true },
];

export default function DashboardUsuarios() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: () => api.get<UserType[]>('/users'), retry: false });
  const users: UserType[] = usersQuery.data ?? [];
  const loading = usersQuery.isLoading;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CORRETOR');
  const [phone, setPhone] = useState('');
  const [creci, setCreci] = useState('');
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [salesMeta, setSalesMeta] = useState(1000000);
  const [active, setActive] = useState(true);

  const refresh = () => qc.invalidateQueries({ queryKey: ['users'] });

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('CORRETOR');
    setPhone('');
    setCreci('');
    setCommissionRate(5.0);
    setSalesMeta(1000000);
    setActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: UserType) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setPhone(u.phone || '');
    setCreci(u.creci || '');
    setCommissionRate(u.commissionRate);
    setSalesMeta(u.salesMeta);
    setActive(u.active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name, email, role, phone, whatsapp: phone,
      creci: role === 'CORRETOR' ? creci : null,
      commissionRate: parseFloat(commissionRate.toString()),
      salesMeta: parseFloat(salesMeta.toString()),
      active,
    };
    if (password) payload.password = password;

    try {
      if (editingId) await api.put(`/users/${editingId}`, payload);
      else await api.post('/users', payload);
      refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir sua própria conta!');
      return;
    }
    if (!confirm('Deseja deletar permanentemente este colaborador?')) return;
    try {
      await api.del(`/users/${id}`);
      refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Equipe & Usuários</h1>
          <p className="text-sm text-muted-foreground font-semibold">Gerencie permissões de corretores, gerentes e administradores.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Adicionar Colaborador
        </button>
      </div>

      {/* Grid Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b bg-secondary/35 text-muted-foreground uppercase tracking-wider font-bold">
                  <th className="p-4">Colaborador</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">CRECI</th>
                  <th className="p-4">Comissão / Meta</th>
                  <th className="p-4">Permissão</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/15 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-foreground block">{u.name}</span>
                        <span className="text-muted-foreground font-medium text-[10px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground/80">{u.phone || 'Não cadastrado'}</td>
                    <td className="p-4 text-muted-foreground font-bold">{u.creci || '---'}</td>
                    <td className="p-4">
                      {u.role === 'CORRETOR' ? (
                        <div>
                          <span className="text-foreground block">{u.commissionRate}% Comissão</span>
                          <span className="text-muted-foreground text-[10px] font-medium">Meta: R$ {u.salesMeta.toLocaleString('pt-BR')}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-normal">Não se aplica</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        u.role === 'GERENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 border hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Users Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in scale-in duration-300">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {editingId ? 'Editar Colaborador' : 'Adicionar Colaborador'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 border rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rodrigo Silva"
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@fabelle.com.br"
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Senha {editingId && '(em branco p/ manter)'}</label>
                  <input
                    type="password"
                    required={!editingId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha forte"
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Permissão / Nível</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                  >
                    <option value="CORRETOR">Corretor</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="FINANCEIRO">Financeiro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              {/* Corretor settings */}
              {role === 'CORRETOR' && (
                <div className="border bg-secondary/15 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase">Registro CRECI</label>
                    <input
                      type="text"
                      required
                      value={creci}
                      onChange={(e) => setCreci(e.target.value)}
                      placeholder="Ex: CRECI-12345F"
                      className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/80 uppercase">Comissão (%)</label>
                      <input
                        type="number"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                        className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/80 uppercase">Meta Vendas (BRL)</label>
                      <input
                        type="number"
                        value={salesMeta}
                        onChange={(e) => setSalesMeta(parseFloat(e.target.value))}
                        className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="active" className="text-xs font-bold text-foreground/80 uppercase cursor-pointer">
                  Conta Ativa (Colaborador pode acessar o sistema)
                </label>
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
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

