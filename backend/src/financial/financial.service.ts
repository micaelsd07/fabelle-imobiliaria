import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { type?: string; category?: string; status?: string }) {
    const where: any = {};
    if (query?.type) where.type = query.type;
    if (query?.category) where.category = query.category;
    if (query?.status) where.status = query.status;

    return this.prisma.transaction.findMany({
      where,
      orderBy: { dueDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException('Lançamento financeiro não encontrado.');
    }
    return transaction;
  }

  async create(data: any) {
    return this.prisma.transaction.create({
      data: {
        description: data.description,
        amount: parseFloat(data.amount),
        type: data.type, // RECEITA, DESPESA
        category: data.category, // ALUGUEL, VENDA, COMISSAO, MARKETING, SALARIO, INFRAESTRUTURA, IMPOSTO, OUTRO
        status: data.status || 'PENDENTE', // PENDENTE, PAGO, ATRASADO
        dueDate: new Date(data.dueDate),
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        paymentMethod: data.paymentMethod,
        contractId: data.contractId,
        createdById: data.createdById,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate);

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.transaction.delete({ where: { id } });
  }

  async getMetrics() {
    const transactions = await this.prisma.transaction.findMany();

    let totalReceitas = 0;
    let totalDespesas = 0;
    let pendingReceitas = 0;
    let pendingDespesas = 0;

    // Monthly aggregates
    const monthlyDataMap: Record<string, { month: string; receita: number; despesa: number; lucro: number }> = {};
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Prepopulate last 6 months for chart representation
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      const mName = monthsNames[idx];
      monthlyDataMap[mName] = { month: mName, receita: 0, despesa: 0, lucro: 0 };
    }

    transactions.forEach((tx) => {
      const monthIndex = new Date(tx.dueDate).getMonth();
      const monthName = monthsNames[monthIndex];

      if (tx.type === 'RECEITA') {
        if (tx.status === 'PAGO') {
          totalReceitas += tx.amount;
        } else {
          pendingReceitas += tx.amount;
        }

        if (monthlyDataMap[monthName]) {
          monthlyDataMap[monthName].receita += tx.amount;
        }
      } else {
        if (tx.status === 'PAGO') {
          totalDespesas += tx.amount;
        } else {
          pendingDespesas += tx.amount;
        }

        if (monthlyDataMap[monthName]) {
          monthlyDataMap[monthName].despesa += tx.amount;
        }
      }
    });

    // Calculate profits (lucro) for the charts
    const chartData = Object.values(monthlyDataMap).map((m) => {
      m.lucro = m.receita - m.despesa;
      return m;
    });

    return {
      revenue: totalReceitas,
      expenses: totalDespesas,
      balance: totalReceitas - totalDespesas,
      pendingIncome: pendingReceitas,
      pendingExpenses: pendingDespesas,
      chartData,
    };
  }
}
