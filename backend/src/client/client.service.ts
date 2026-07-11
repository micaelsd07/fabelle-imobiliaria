import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    return this.prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        leads: true,
        visits: {
          include: { property: true },
        },
        contracts: {
          include: { property: true },
        },
      },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return client;
  }

  async create(data: any) {
    return this.prisma.client.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }
}
