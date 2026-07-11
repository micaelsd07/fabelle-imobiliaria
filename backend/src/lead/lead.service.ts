import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; brokerId?: string; status?: string }) {
    const where: any = {};

    if (query?.brokerId) {
      where.brokerId = query.brokerId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        broker: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        broker: { select: { id: true, name: true, photo: true } },
        client: { select: { id: true, name: true, email: true, phone: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) {
      throw new NotFoundException('Lead não encontrado.');
    }
    return lead;
  }

  async create(data: any) {
    const lead = await this.prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        source: data.source || 'SITE',
        status: data.status || 'NOVO',
        notes: data.notes,
        brokerId: data.brokerId,
        clientId: data.clientId,
      },
    });

    await this.prisma.leadHistory.create({
      data: {
        leadId: lead.id,
        type: 'STATUS_CHANGE',
        content: `Lead cadastrado na origem ${lead.source}.`,
      },
    });

    return this.findOne(lead.id);
  }

  async update(id: string, data: any) {
    const current = await this.findOne(id);

    // If status changed, write a history entry
    if (data.status && data.status !== current.status) {
      await this.prisma.leadHistory.create({
        data: {
          leadId: id,
          type: 'STATUS_CHANGE',
          content: `Funil atualizado: de "${current.status}" para "${data.status}".`,
        },
      });
    }

    await this.prisma.lead.update({
      where: { id },
      data,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.delete({ where: { id } });
  }

  async addHistory(leadId: string, type: string, content: string, createdById?: string) {
    await this.findOne(leadId);
    return this.prisma.leadHistory.create({
      data: {
        leadId,
        type,
        content,
        createdById,
      },
    });
  }

  async getFunnelStats() {
    const counts = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    return counts.reduce((acc, current) => {
      acc[current.status] = current._count._all;
      return acc;
    }, {} as Record<string, number>);
  }
}
