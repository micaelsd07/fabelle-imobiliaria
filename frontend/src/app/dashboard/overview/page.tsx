'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardStats, useFinancialMetrics } from '@/lib/queries';
import {
  Building2,
  Users,
  FileSignature,
  DollarSign,
  Compass,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  properties: { total: number; available: number; rented: number; sold: number };
  clients: number;
  activeContracts: number;
  brokers: number;
  upcomingVisits: number;
  financial: { monthlyRevenue: number; pendingPaymentsCount: number; overduePaymentsCount: number };
  recentLeads: Array<{ id: string; name: string; email: string; source: string; status: string; createdAt: string; broker?: { name: string } }>;
  sourceChartData: Array<{ name: string; value: number }>;
}

interface FinancialMetrics {
  revenue: number;
  expenses: number;
  balance: number;
  pendingIncome: number;
  pendingExpenses: number;
  chartData: Array<{ month: string; receita: number; despesa: number; lucro: number }>;
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const MOCK_STATS: DashboardData = {
  properties: { total: 4, available: 3, rented: 1, sold: 0 },
  clients: 3,
  activeContracts: 1,
  brokers: 2,
  upcomingVisits: 1,
  financial: { monthlyRevenue: 7500, pendingPaymentsCount: 1, overduePaymentsCount: 1 },
  recentLeads: [
    { id: '1', name: 'Fernanda Martins', email: 'fernanda.martins@email.com', source: 'SITE', status: 'NOVO', createdAt: new Date().toISOString(), broker: { name: 'Rodrigo Silva' } },
    { id: '2', name: 'Gabriel Albuquerque', email: 'gabriel.albu@email.com', source: 'GOOGLE', status: 'CONTATADO', createdAt: new Date().toISOString(), broker: { name: 'Amanda Souza' } },
    { id: '3', name: 'Lucas Pinho', email: 'lucas.pinho@email.com', source: 'WHATSAPP', status: 'VISITA_AGENDADA', createdAt: new Date().toISOString() },
  ],
  sourceChartData: [
    { name: 'SITE', value: 2 },
    { name: 'GOOGLE', value: 1 },
    { name: 'WHATSAPP', value: 1 },
  ],
};

const MOCK_FIN: FinancialMetrics = {
  revenue: 145000,
  expenses: 85000,
  balance: 60000,
  pendingIncome: 7500,
  pendingExpenses: 12000,
  chartData: [
    { month: 'Jan', receita: 15000, despesa: 12000, lucro: 3000 },
    { month: 'Fev', receita: 22000, despesa: 14000, lucro: 8000 },
    { month: 'Mar', receita: 35000, despesa: 18000, lucro: 17000 },
    { month: 'Abr', receita: 28000, despesa: 15000, lucro: 13000 },
    { month: 'Mai', receita: 30000, despesa: 13000, lucro: 17000 },
    { month: 'Jun', receita: 45000, despesa: 19000, lucro: 26000 },
  ],
};

export default function DashboardOverview() {
  const statsQuery = useDashboardStats();
  const finQuery = useFinancialMetrics();

  if (statsQuery.isLoading || finQuery.isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats: DashboardData = statsQuery.data ?? { properties: { total: 0, available: 0, rented: 0, sold: 0 }, clients: 0, activeContracts: 0, brokers: 0, upcomingVisits: 0, financial: { monthlyRevenue: 0, pendingPaymentsCount: 0, overduePaymentsCount: 0 }, recentLeads: [], sourceChartData: [] };
  const finMetrics: FinancialMetrics = finQuery.data ?? { revenue: 0, expenses: 0, balance: 0, pendingIncome: 0, pendingExpenses: 0, chartData: [] };

  const kpis = [
    {
      title: 'Receita Mensal',
      value: stats.financial.monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      description: `${stats.financial.pendingPaymentsCount} cobranÃ§as pendentes`,
    },
    {
      title: 'Total de ImÃ³veis',
      value: stats.properties.total,
      icon: Building2,
      color: 'bg-primary/10 text-primary border-primary/20',
      description: `${stats.properties.available} disponÃ­veis para comercializaÃ§Ã£o`,
    },
    {
      title: 'Clientes Ativos',
      value: stats.clients,
      icon: Users,
      color: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      description: `${stats.brokers} corretores responsÃ¡veis`,
    },
    {
      title: 'Visitas Pendentes',
      value: stats.upcomingVisits,
      icon: Calendar,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      description: 'PrÃ³ximas visitas agendadas',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">VisÃ£o Geral</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Bem-vindo ao painel corporativo da Fabelle ImobiliÃ¡ria.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
            <Sparkles className="h-4.5 w-4.5" /> Modo Admin Ativo
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-card text-card-foreground border rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{kpi.title}</span>
                <h3 className="text-2xl font-black text-foreground">{kpi.value}</h3>
                <span className="text-[11px] text-muted-foreground font-medium block">{kpi.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Desempenho Financeiro
              </h3>
              <p className="text-xs text-muted-foreground font-medium">Comparativo de entradas e saÃ­das nos Ãºltimos meses</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finMetrics.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="receita" name="Receita (R$)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" name="Despesa (R$)" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" /> Origem dos Leads
              </h3>
              <p className="text-xs text-muted-foreground font-medium">Canais de captaÃ§Ã£o de clientes</p>
            </div>
          </div>
          <div className="h-60 w-full relative flex items-center justify-center">
            {stats.sourceChartData.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados suficientes</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sourceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend Table */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {stats.sourceChartData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-muted-foreground truncate">{s.name}:</span>
                <span className="text-foreground font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table and Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent leads table */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-extrabold text-base text-foreground">Novos Leads Recebidos</h3>
            <Link href="/dashboard/leads" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              Gerenciar Funil <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Origem</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">ResponsÃ¡vel</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold">
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-secondary/20">
                    <td className="py-3">
                      <span className="font-bold text-foreground text-sm block">{lead.name}</span>
                      <span className="text-muted-foreground font-medium text-[10px]">{lead.email}</span>
                    </td>
                    <td className="py-3">
                      <span className="bg-secondary px-2 py-0.5 rounded text-[10px] text-foreground font-bold">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        lead.status === 'NOVO' ? 'bg-primary/10 text-primary border-primary/20' :
                        lead.status === 'CONTATADO' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {lead.broker?.name || 'NÃ£o atribuÃ­do'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Map visual card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-extrabold text-base text-foreground">Mapa de ImÃ³veis Ativos</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">GeolocalizaÃ§Ã£o fÃ­sica das propriedades cadastradas</p>
            </div>
            <Link href="/dashboard/imoveis" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              Ver ImÃ³veis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-64 w-full border rounded-xl overflow-hidden shadow-xs">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-46.72%2C-23.60%2C-46.62%2C-23.54&layer=mapnik&marker=-23.5639%2C-46.6627"
              className="w-full h-full border-none"
              title="VisÃ£o Geral do Mapa"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

