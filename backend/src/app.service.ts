import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Fabelle Imobiliária API - Online';
  }

  async getDashboardStats() {
    // 1. Properties status counts
    const propertyCounts = await this.prisma.property.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const propStats = {
      total: 0,
      available: 0,
      rented: 0,
      sold: 0,
    };

    propertyCounts.forEach((c) => {
      propStats.total += c._count._all;
      if (c.status === 'DISPONIVEL') propStats.available = c._count._all;
      if (c.status === 'ALUGADO') propStats.rented = c._count._all;
      if (c.status === 'VENDIDO') propStats.sold = c._count._all;
    });

    // 2. Client count
    const totalClients = await this.prisma.client.count();

    // 3. Active contracts count
    const activeContracts = await this.prisma.contract.count({
      where: { status: 'ATIVO' },
    });

    // 4. Broker count
    const totalBrokers = await this.prisma.user.count({
      where: { role: 'CORRETOR' },
    });

    // 5. Visits scheduled (today or in the future)
    const upcomingVisits = await this.prisma.visit.count({
      where: {
        dateTime: { gte: new Date() },
        status: 'AGENDADA',
      },
    });

    // 6. Financial Overview (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyTransactions = await this.prisma.transaction.findMany({
      where: {
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let monthlyRevenue = 0;
    let pendingPayments = 0;
    let overduePayments = 0;

    monthlyTransactions.forEach((t) => {
      if (t.type === 'RECEITA') {
        if (t.status === 'PAGO') {
          monthlyRevenue += t.amount;
        } else if (t.status === 'PENDENTE') {
          pendingPayments++;
        } else if (t.status === 'ATRASADO') {
          overduePayments++;
        }
      }
    });

    // 7. Recent Leads
    const recentLeads = await this.prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        broker: { select: { name: true } },
      },
    });

    // 8. Leads by Source for Pie Chart
    const leadsBySource = await this.prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
    });

    const sourceChartData = leadsBySource.map((s) => ({
      name: s.source,
      value: s._count._all,
    }));

    return {
      properties: propStats,
      clients: totalClients,
      activeContracts,
      brokers: totalBrokers,
      upcomingVisits,
      financial: {
        monthlyRevenue,
        pendingPaymentsCount: pendingPayments,
        overduePaymentsCount: overduePayments,
      },
      recentLeads,
      sourceChartData,
    };
  }
}
