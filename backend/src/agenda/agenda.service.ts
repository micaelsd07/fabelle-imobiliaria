import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { brokerId?: string; clientId?: string }) {
    const where: any = {};
    if (query?.brokerId) where.brokerId = query.brokerId;
    if (query?.clientId) where.clientId = query.clientId;

    return this.prisma.visit.findMany({
      where,
      include: {
        broker: { select: { id: true, name: true, phone: true } },
        client: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, code: true, address: true } },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        broker: { select: { id: true, name: true, phone: true } },
        client: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, title: true, code: true, address: true } },
      },
    });
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }
    return visit;
  }

  async create(data: any) {
    return this.prisma.visit.create({
      data: {
        dateTime: new Date(data.dateTime),
        status: data.status || 'AGENDADA',
        notes: data.notes,
        brokerId: data.brokerId,
        clientId: data.clientId,
        propertyId: data.propertyId,
      },
      include: {
        broker: { select: { name: true } },
        client: { select: { name: true } },
        property: { select: { code: true } },
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.dateTime) {
      updateData.dateTime = new Date(data.dateTime);
    }
    return this.prisma.visit.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.visit.delete({ where: { id } });
  }
}
