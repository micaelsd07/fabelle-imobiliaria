import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        client: { select: { id: true, name: true, phone: true } },
        property: { select: { id: true, code: true, title: true, price: true } },
        broker: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        property: { select: { id: true, code: true, title: true, price: true, address: true } },
        broker: { select: { id: true, name: true, commissionRate: true } },
      },
    });
    if (!contract) {
      throw new NotFoundException('Contrato não encontrado.');
    }
    return contract;
  }

  async create(data: any) {
    return this.prisma.contract.create({
      data: {
        title: data.title,
        type: data.type,
        status: 'RASCUNHO',
        value: parseFloat(data.value),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        pdfUrl: data.pdfUrl,
        signatureStatus: 'PENDENTE',
        clientId: data.clientId,
        propertyId: data.propertyId,
        brokerId: data.brokerId,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.value) updateData.value = parseFloat(data.value);

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contract.delete({ where: { id } });
  }

  async signContract(id: string, signature: string) {
    const contract = await this.findOne(id);

    // Update contract status
    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'ATIVO',
        signatureStatus: 'ASSINADO',
        clientSignature: signature,
      },
    });

    // Mark property status to ALUGADO or VENDIDO
    const propertyStatus = contract.type === 'ALUGUEL' ? 'ALUGADO' : 'VENDIDO';
    await this.prisma.property.update({
      where: { id: contract.propertyId },
      data: { status: propertyStatus },
    });

    // Create Finance Entry - Revenue
    await this.prisma.transaction.create({
      data: {
        description: `Entrada contrato ${contract.type} - ${contract.property.code}`,
        amount: contract.value,
        type: 'RECEITA',
        category: contract.type === 'ALUGUEL' ? 'ALUGUEL' : 'VENDA',
        status: 'PAGO',
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentMethod: 'PIX',
        contractId: id,
      },
    });

    // Create Finance Entry - Broker Commission (if broker exists)
    if (contract.brokerId) {
      const broker = contract.broker;
      const rate = broker?.commissionRate || 5.0; // 5% default
      const commissionValue = (contract.value * rate) / 100;

      await this.prisma.transaction.create({
        data: {
          description: `Comissão de intermediação corretor(a) ${broker?.name} - Contrato ${contract.property.code}`,
          amount: commissionValue,
          type: 'DESPESA',
          category: 'COMISSAO',
          status: 'PENDENTE',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
          contractId: id,
        },
      });
    }

    return updatedContract;
  }
}
