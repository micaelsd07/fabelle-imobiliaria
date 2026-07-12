import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CLIENT_TYPES = ['COMPRADOR', 'LOCATARIO', 'LOCADOR', 'INTERESSADO'];

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, clientType?: string) {
    const where: any = {};

    if (clientType && CLIENT_TYPES.includes(clientType)) {
      where.clientType = clientType;
    }

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

  async findOwners(search?: string) {
    const properties = await this.prisma.property.findMany({
      where: {
        ownerName: search
          ? { contains: search, mode: 'insensitive' }
          : { not: null },
      },
      select: {
        id: true,
        code: true,
        title: true,
        status: true,
        type: true,
        ownerName: true,
        ownerCpf: true,
        ownerRg: true,
        ownerPhone: true,
        ownerEmail: true,
        ownerAddress: true,
        ownerProfession: true,
        ownerCivilStatus: true,
        spouseName: true,
        spouseCpf: true,
        spousePhone: true,
        createdAt: true,
      },
      orderBy: { ownerName: 'asc' },
    });

    const owners = new Map<string, any>();

    for (const property of properties) {
      if (!property.ownerName?.trim()) continue;
      const key = property.ownerCpf || property.ownerEmail || `${property.ownerName}-${property.ownerPhone || ''}`;
      const current = owners.get(key);
      const propertyInfo = {
        id: property.id,
        code: property.code,
        title: property.title,
        status: property.status,
        type: property.type,
      };

      if (current) {
        current.properties.push(propertyInfo);
        continue;
      }

      owners.set(key, {
        id: key,
        clientType: 'LOCADOR',
        name: property.ownerName,
        cpf: property.ownerCpf,
        rg: property.ownerRg,
        phone: property.ownerPhone,
        whatsapp: property.ownerPhone,
        email: property.ownerEmail,
        address: property.ownerAddress,
        profession: property.ownerProfession,
        civilStatus: property.ownerCivilStatus,
        spouseName: property.spouseName,
        spouseCpf: property.spouseCpf,
        spousePhone: property.spousePhone,
        createdAt: property.createdAt,
        properties: [propertyInfo],
      });
    }

    return Array.from(owners.values());
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
      throw new NotFoundException('Cliente nao encontrado.');
    }
    return client;
  }

  async create(data: any) {
    return this.prisma.client.create({
      data: {
        ...data,
        clientType: CLIENT_TYPES.includes(data.clientType) ? data.clientType : 'COMPRADOR',
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const patch = { ...data };
    if (patch.clientType && !CLIENT_TYPES.includes(patch.clientType)) {
      patch.clientType = 'COMPRADOR';
    }
    return this.prisma.client.update({
      where: { id },
      data: patch,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }
}
