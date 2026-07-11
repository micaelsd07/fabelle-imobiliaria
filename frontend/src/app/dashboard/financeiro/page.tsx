'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { exportCSV, exportPDF, fmtBRL, fmtDate, type ColumnDef } from '@/lib/export';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  X,
  FileSpreadsheet,
  FileDown,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string; // RECEITA, DESPESA
  category: string; // ALUGUEL, VENDA, COMISSAO, MARKETING, SALARIO, INFRAESTRUTURA, IMPOSTO, OUTRO
  status: string; // PENDENTE, PAGO, ATRASADO
  dueDate: string;
  paymentDate?: string | null;
  paymentMethod?: string | null;
}

interface FinancialMetrics {
  revenue: number;
  expenses: number;
  balance: number;
  pendingIncome: number;
  pendingExpenses: number;
}

const MOCK_TXS: Transaction[] = [
  { id: '1', description: 'LocaÃ§Ã£o residencial Pinheiros FAB-002', amount: 7500, type: 'RECEITA', category: 'ALUGUEL', status: 'PAGO', dueDate: new Date().toISOString(), paymentDate: new Date().toISOString(), paymentMethod: 'PIX' },
  { id: '2', description: 'Taxa Administrativa Contrato LocaÃ§Ã£o', amount: 450, type: 'RECEITA', category: 'OUTRO', status: 'ATRASADO', dueDate: new Date().toISOString() },
  { id: '3', description: 'ComissÃ£o Corretor Rodrigo Silva - FAB-001', amount: 12000, type: 'DESPESA', category: 'COMISSAO', status: 'PENDENTE', dueDate: new Date().toISOString() },
];

const MOCK_METRICS: FinancialMetrics = {
  revenue: 7500, expenses: 0, balance: 7500, pendingIncome: 450, pendingExpenses: 12000,
};

export default function DashboardFinanceiro() {
  const qc = useQueryClient();
  const txQuery = useQuery({ queryKey: ['financial'], queryFn: () => api.get<Transaction[]>('/financial'), retry: false });
  const metricsQuery = useQuery({ queryKey: ['financial', 'metrics'], queryFn: () => api.get<FinancialMetrics>('/financial/metrics'), retry: false });

  const transactions: Transaction[] = txQuery.data ?? [];
  const metrics: FinancialMetrics | null = metricsQuery.data ?? null;
  const loading = txQuery.isLoading || metricsQuery.isLoading;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState('RECEITA');
  const [category, setCategory] = useState('ALUGUEL');
  const [status, setStatus] = useState('PENDENTE');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ['financial'] });
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      description,
      amount: parseFloat(amount.toString()),
      type, category, status, dueDate,
      paymentMethod: status === 'PAGO' ? paymentMethod : null,
      paymentDate: status === 'PAGO' ? new Date().toISOString() : null,
    };
    try {
      await api.post('/financial', payload);
      refetchAll();
    } catch (error) { alert(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
    setModalOpen(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Deseja excluir este lanÃ§amento financeiro?')) return;
    try {
      await api.del(`/financial/${id}`);
      refetchAll();
    } catch (error) { alert(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.'); }
  };

  const exportColumns: ColumnDef<Transaction>[] = [
    { header: 'Descrição', accessor: (t) => t.description },
    { header: 'Tipo', accessor: (t) => t.type },
    { header: 'Categoria', accessor: (t) => t.category },
    { header: 'Status', accessor: (t) => t.status },
    { header: 'Vencimento', accessor: (t) => fmtDate(t.dueDate) },
    { header: 'Pagamento', accessor: (t) => (t.paymentDate ? fmtDate(t.paymentDate) : '—') },
    { header: 'Método', accessor: (t) => t.paymentMethod || '—' },
    { header: 'Valor (R$)', accessor: (t) => fmtBRL(t.amount) },
  ];

  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      alert('Nenhum lançamento a exportar.');
      return;
    }
    exportCSV(filteredTxs, exportColumns, 'financeiro');
  };

  const handleExportPDF = () => {
    if (filteredTxs.length === 0) {
      alert('Nenhum lançamento a exportar.');
      return;
    }
    const summary = metrics
      ? `Receitas: ${fmtBRL(metrics.revenue)}   •   Despesas: ${fmtBRL(metrics.expenses)}   •   Saldo: ${fmtBRL(metrics.balance)}`
      : `${filteredTxs.length} lançamentos`;
    exportPDF(filteredTxs, exportColumns, {
      baseName: 'financeiro',
      title: 'Relatório Financeiro — Fluxo de Caixa',
      subtitle: summary,
    });
  };

  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? tx.type === typeFilter : true;
    const matchesCategory = categoryFilter ? tx.category === categoryFilter : true;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Fluxo Financeiro</h1>
          <p className="text-sm text-muted-foreground font-semibold">BalanÃ§o consolidado, repasse de aluguÃ©is e comissÃµes corporativas.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="border hover:bg-secondary text-foreground font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" /> Exportar CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="border hover:bg-secondary text-foreground font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="h-4.5 w-4.5 text-red-500" /> Exportar PDF
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer text-xs"
          >
            <Plus className="h-4.5 w-4.5" /> Adicionar LanÃ§amento
          </button>
        </div>
      </div>

      {/* Metrics widgets */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl shrink-0">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Entradas Efetuadas</span>
              <h3 className="text-2xl font-black text-foreground">
                {metrics.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold block">A receber: R$ {metrics.pendingIncome.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl shrink-0">
              <ArrowDownRight className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">SaÃ­das Efetuadas</span>
              <h3 className="text-2xl font-black text-foreground">
                {metrics.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold block">A pagar: R$ {metrics.pendingExpenses.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">BalanÃ§o LÃ­quido</span>
              <h3 className="text-2xl font-black text-foreground">
                {metrics.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold block">Saldo em conta da Fabelle</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-card border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descriÃ§Ã£o ou categoria..."
            className="w-full bg-secondary/40 border pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/45 text-foreground text-sm"
          />
        </div>

        <div className="w-full md:w-44 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-secondary/40 border px-3 py-2.5 rounded-xl outline-none text-foreground text-sm cursor-pointer"
          >
            <option value="">Todas TransaÃ§Ãµes</option>
            <option value="RECEITA">Entradas (Receitas)</option>
            <option value="DESPESA">SaÃ­das (Despesas)</option>
          </select>
        </div>

        <div className="w-full md:w-44 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-secondary/40 border px-3 py-2.5 rounded-xl outline-none text-foreground text-sm cursor-pointer"
          >
            <option value="">Todas Categorias</option>
            <option value="ALUGUEL">AluguÃ©is</option>
            <option value="VENDA">Vendas</option>
            <option value="COMISSAO">ComissÃµes</option>
            <option value="SALARIO">Folha de SalÃ¡rio</option>
            <option value="MARKETING">Marketing</option>
            <option value="INFRAESTRUTURA">Infraestrutura</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
          </div>
        ) : filteredTxs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm font-semibold">
            Nenhuma transaÃ§Ã£o registrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b bg-secondary/35 text-muted-foreground uppercase tracking-wider font-bold">
                  <th className="p-4">DescriÃ§Ã£o</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-sm text-foreground block">{tx.description}</span>
                      {tx.paymentMethod && (
                        <span className="text-[10px] text-muted-foreground font-medium block">Forma: {tx.paymentMethod}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-secondary px-2.5 py-0.5 rounded text-[10px] text-foreground font-bold">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`p-4 font-black text-sm ${tx.type === 'RECEITA' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'RECEITA' ? '+' : '-'} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        tx.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        tx.status === 'PENDENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-1.5 border hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in scale-in duration-300">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Registrar LanÃ§amento
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 border rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">DescriÃ§Ã£o HistÃ³rico</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Recebimento ComissÃµes FAB-001"
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                  >
                    <option value="RECEITA">Entrada (Receita)</option>
                    <option value="DESPESA">SaÃ­da (Despesa)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                  >
                    <option value="ALUGUEL">Aluguel</option>
                    <option value="VENDA">Venda ImÃ³vel</option>
                    <option value="COMISSAO">ComissÃ£o</option>
                    <option value="SALARIO">SalÃ¡rio</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="INFRAESTRUTURA">Infraestrutura</option>
                    <option value="OUTRO">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Valor do LanÃ§amento</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    placeholder="1200"
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-semibold text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">SituaÃ§Ã£o</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Efetuado (Pago)</option>
                    <option value="ATRASADO">Atrasado</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">MÃ©todo Pagamento</label>
                  <select
                    value={paymentMethod}
                    disabled={status !== 'PAGO'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer disabled:opacity-50"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto BancÃ¡rio</option>
                    <option value="CARTAO">CartÃ£o</option>
                    <option value="TED">TransferÃªncia (TED)</option>
                  </select>
                </div>
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
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

