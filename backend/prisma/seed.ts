import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed database...');

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.propertyPhoto.deleteMany();
  await prisma.leadHistory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const saltRounds = 10;
  const hashPassword = async (pwd: string) => bcrypt.hash(pwd, saltRounds);

  const adminPwd = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fabelle.com.br',
      passwordHash: adminPwd,
      name: 'Fabelle Admin',
      role: 'ADMIN',
      phone: '(11) 99999-1111',
      whatsapp: '(11) 99999-1111',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  const managerPwd = await hashPassword('gerente123');
  const manager = await prisma.user.create({
    data: {
      email: 'gerente@fabelle.com.br',
      passwordHash: managerPwd,
      name: 'Carla Gerente',
      role: 'GERENTE',
      phone: '(11) 99999-2222',
      whatsapp: '(11) 99999-2222',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  });

  const broker1Pwd = await hashPassword('corretor123');
  const broker1 = await prisma.user.create({
    data: {
      email: 'corretor1@fabelle.com.br',
      passwordHash: broker1Pwd,
      name: 'Rodrigo Silva',
      role: 'CORRETOR',
      creci: 'CRECI-12345F',
      phone: '(11) 98888-3333',
      whatsapp: '(11) 98888-3333',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      commissionRate: 5.0,
      salesMeta: 2000000,
    },
  });

  const broker2 = await prisma.user.create({
    data: {
      email: 'corretor2@fabelle.com.br',
      passwordHash: broker1Pwd,
      name: 'Amanda Souza',
      role: 'CORRETOR',
      creci: 'CRECI-67890F',
      phone: '(11) 97777-4444',
      whatsapp: '(11) 97777-4444',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      commissionRate: 6.0,
      salesMeta: 1500000,
    },
  });

  const receptionistPwd = await hashPassword('recepcao123');
  const receptionist = await prisma.user.create({
    data: {
      email: 'recepcao@fabelle.com.br',
      passwordHash: receptionistPwd,
      name: 'Juliana Recepcionista',
      role: 'RECEPCIONISTA',
      phone: '(11) 96666-5555',
    },
  });

  const financePwd = await hashPassword('financeiro123');
  const finance = await prisma.user.create({
    data: {
      email: 'financeiro@fabelle.com.br',
      passwordHash: financePwd,
      name: 'Marcos Financeiro',
      role: 'FINANCEIRO',
      phone: '(11) 95555-6666',
    },
  });

  console.log('Seeded users...');

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'João Pedro de Oliveira',
      cpf: '123.456.789-00',
      phone: '(11) 98111-2222',
      whatsapp: '(11) 98111-2222',
      email: 'joao.pedro@email.com',
      civilStatus: 'Casado',
      profession: 'Engenheiro de Software',
      income: 18000,
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      notes: 'Procura apartamento com 3 quartos em Pinheiros ou Itaim.',
      preferences: 'APARTAMENTO,3 quartos,Pinheiros,Itaim Bibi',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Mariana Costa Rodrigues',
      cpf: '987.654.321-11',
      phone: '(11) 98222-3333',
      whatsapp: '(11) 98222-3333',
      email: 'mariana.costa@email.com',
      civilStatus: 'Solteira',
      profession: 'Médica Cardiologista',
      income: 25000,
      address: 'Rua Bela Cintra, 450',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01415-000',
      notes: 'Interessada em coberturas ou apartamentos modernos com piscina.',
      preferences: 'COBERTURA,APARTAMENTO,Piscina,Jardins',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Roberto Souza Neto',
      cpf: '456.789.123-22',
      phone: '(11) 98333-4444',
      whatsapp: '(11) 98333-4444',
      email: 'roberto.neto@email.com',
      civilStatus: 'Divorciado',
      profession: 'Empresário',
      income: 35000,
      address: 'Rua Amauri, 120',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01448-000',
      notes: 'Busca casa comercial para nova sede de empresa.',
      preferences: 'SALA_COMERCIAL,PREDIO',
    },
  });

  console.log('Seeded clients...');

  // Create Properties
  const prop1 = await prisma.property.create({
    data: {
      code: 'FAB-001',
      title: 'Cobertura Duplex de Alto Padrão nos Jardins',
      description: 'Lindo duplex totalmente reformado com acabamentos premium em mármore, automação residencial completa, terraço privativo com piscina aquecida e vista panorâmica incrível de 360 graus para a cidade.',
      price: 4200000,
      type: 'VENDA',
      category: 'COBERTURA',
      status: 'DISPONIVEL',
      areaTotal: 320,
      areaConstruida: 280,
      bedrooms: 4,
      suites: 3,
      bathrooms: 5,
      garageSlots: 3,
      pool: true,
      grill: true,
      condoFee: 2800,
      iptu: 850,
      address: 'Alameda Lorena, 1500',
      zipCode: '01424-002',
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Jardins',
      latitude: -23.5639,
      longitude: -46.6627,
      photos: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
      features: 'Mobiliado, Ar Condicionado, Elevador Privativo, Portaria 24h, Piscina, Churrasqueira',
      brokerId: broker1.id,
      featured: true
    }
  });

  const prop2 = await prisma.property.create({
    data: {
      code: 'FAB-002',
      title: 'Casa Contemporânea de Luxo em Alphaville',
      description: 'Projeto arquitetônico assinado com linhas modernas, pé-direito duplo, integração completa de ambientes, 4 suítes master com closet, área de lazer privativa de tirar o fôlego com sauna, churrasqueira e piscina de borda infinita.',
      price: 3800000,
      type: 'VENDA',
      category: 'CASA',
      status: 'DISPONIVEL',
      areaTotal: 650,
      areaConstruida: 480,
      bedrooms: 5,
      suites: 4,
      bathrooms: 6,
      garageSlots: 4,
      pool: true,
      grill: false,
      condoFee: 1200,
      iptu: 450,
      address: 'Avenida Alphaville, 3200',
      zipCode: '06472-010',
      city: 'Barueri',
      state: 'SP',
      neighborhood: 'Alphaville',
      latitude: -23.4975,
      longitude: -46.8522,
      photos: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600',
      features: 'Piscina de Borda Infinita, Sauna, Espaço Gourmet, Automação, Energia Solar',
      brokerId: broker1.id,
      featured: true
    }
  });

  const prop3 = await prisma.property.create({
    data: {
      code: 'FAB-003',
      title: 'Apartamento Minimalista no Itaim Bibi',
      description: 'Decorado por arquiteto renomado em estilo minimalista contemporâneo, mobiliário de design nacional incluso (porteira fechada), ar condicionado em todos os cômodos e sacada integrada com cortina de vidro.',
      price: 2100000,
      type: 'VENDA',
      category: 'APARTAMENTO',
      status: 'DISPONIVEL',
      areaTotal: 110,
      areaConstruida: 110,
      bedrooms: 2,
      suites: 2,
      bathrooms: 3,
      garageSlots: 2,
      pool: false,
      grill: false,
      condoFee: 1400,
      iptu: 380,
      address: 'Rua Clodomiro Amazonas, 850',
      zipCode: '04537-001',
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Itaim Bibi',
      latitude: -23.5855,
      longitude: -46.6772,
      photos: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600',
      features: 'Porteira Fechada, Mobiliado, Varanda Gourmet, Academia, Salão de Festas',
      brokerId: broker1.id,
      featured: true
    }
  });

  const prop4 = await prisma.property.create({
    data: {
      code: 'FAB-004',
      title: 'Apartamento aconchegante em Pinheiros',
      description: 'Apartamento moderno e reformado em localização espetacular a poucos metros do metrô Fradique Coutinho. Totalmente equipado com marcenaria planejada, iluminação em LED e eletrodomésticos de última geração.',
      price: 4500,
      type: 'ALUGUEL',
      category: 'APARTAMENTO',
      status: 'DISPONIVEL',
      areaTotal: 85,
      areaConstruida: 85,
      bedrooms: 2,
      suites: 1,
      bathrooms: 2,
      garageSlots: 1,
      pool: false,
      grill: false,
      condoFee: 950,
      iptu: 220,
      address: 'Rua dos Pinheiros, 450',
      zipCode: '05422-000',
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Pinheiros',
      latitude: -23.5678,
      longitude: -46.6853,
      photos: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
      features: 'Armários Planejados, Aquecimento a Gás, Portaria Remota, Pet Friendly',
      brokerId: broker1.id,
      featured: false
    }
  });

  const prop5 = await prisma.property.create({
    data: {
      code: 'FAB-005',
      title: 'Sala Comercial no Edifício Paulista Corporate',
      description: 'Conjunto comercial de alto padrão pronto para uso com divisórias em vidro duplo acústico, piso elevado em ardósia, ar condicionado central VRF, copa completa e 2 banheiros privativos. Localização icônica.',
      price: 950000,
      type: 'VENDA',
      category: 'SALA_COMERCIAL',
      status: 'DISPONIVEL',
      areaTotal: 92,
      areaConstruida: 92,
      bedrooms: 0,
      suites: 0,
      bathrooms: 2,
      garageSlots: 2,
      pool: false,
      grill: false,
      condoFee: 1800,
      iptu: 580,
      address: 'Avenida Paulista, 1000',
      zipCode: '01310-100',
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Bela Vista',
      latitude: -23.5615,
      longitude: -46.6562,
      photos: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600',
      features: 'Piso Elevado, Heliponto, Auditório, Controle de Acesso, Ar Condicionado Central',
      brokerId: broker1.id,
      featured: false
    }
  });

  const prop6 = await prisma.property.create({
    data: {
      code: 'FAB-006',
      title: 'Terreno Plano para Construção Comercial',
      description: 'Excelente terreno comercial totalmente plano em via de altíssimo fluxo no coração do polo comercial. Pronto para construir redes varejistas, concessionárias, supermercados ou mall comercial.',
      price: 1800000,
      type: 'VENDA',
      category: 'TERRENO',
      status: 'DISPONIVEL',
      areaTotal: 1200,
      areaConstruida: 0,
      bedrooms: 0,
      suites: 0,
      bathrooms: 0,
      garageSlots: 0,
      pool: false,
      grill: false,
      condoFee: 0,
      iptu: 1100,
      address: 'Avenida Cassiano Ricardo, 1500',
      zipCode: '12246-870',
      city: 'São José dos Campos',
      state: 'SP',
      neighborhood: 'Jardim Aquarius',
      latitude: -23.2185,
      longitude: -45.9082,
      photos: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
      features: 'Topografia Plana, Esquina Comercial, Zoneamento ZUC-1',
      brokerId: broker1.id,
      featured: false
    }
  });

  const seededProperties = [prop1, prop2, prop3, prop4, prop5, prop6];
  for (const property of seededProperties) {
    const urls = property.photos
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    await prisma.propertyPhoto.createMany({
      data: urls.map((url, index) => ({
        propertyId: property.id,
        url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
  }

  console.log('Seeded properties and property photos...');

  // Create Leads (Kanban representation)
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Fernanda Martins',
      email: 'fernanda.martins@email.com',
      phone: '(11) 99122-3344',
      whatsapp: '(11) 99122-3344',
      source: 'SITE',
      status: 'NOVO',
      notes: 'Solicitou informações pelo formulário do site sobre o duplex nos Jardins.',
      brokerId: broker1.id,
      clientId: client1.id,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: lead1.id,
      type: 'STATUS_CHANGE',
      content: 'Lead capturado automaticamente via Formulário Web.',
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Gabriel Albuquerque',
      email: 'gabriel.albu@email.com',
      phone: '(11) 99233-4455',
      whatsapp: '(11) 99233-4455',
      source: 'GOOGLE',
      status: 'CONTATADO',
      notes: 'Ligado para qualificar. Demonstrou interesse no aluguel em Pinheiros.',
      brokerId: broker2.id,
      clientId: client2.id,
    },
  });

  await prisma.leadHistory.createMany({
    data: [
      { leadId: lead2.id, type: 'CALL', content: 'Primeira ligação realizada. Cliente receptivo.' },
      { leadId: lead2.id, type: 'ANNOTATION', content: 'Agendar visita assim que o cliente voltar de viagem no dia 10.' },
    ],
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: 'Lucas Pinho Mendonça',
      email: 'lucas.pinho@email.com',
      phone: '(11) 99344-5566',
      whatsapp: '(11) 99344-5566',
      source: 'WHATSAPP',
      status: 'VISITA_AGENDADA',
      notes: 'Visita agendada para sábado de manhã no imóvel de Cidade Jardim.',
      brokerId: broker1.id,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: lead3.id,
      type: 'STATUS_CHANGE',
      content: 'Visita agendada para dia 12/07 às 10:00.',
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      name: 'Clara Silveira',
      email: 'clara.silveira@email.com',
      phone: '(11) 99455-6677',
      whatsapp: '(11) 99455-6677',
      source: 'INSTAGRAM',
      status: 'PROPOSTA',
      notes: 'Enviou proposta formal para compra do Duplex. Valor proposto: R$ 4.000.000 (à vista).',
      brokerId: broker1.id,
    },
  });

  console.log('Seeded leads...');

  // Create Visits
  const visitDate = new Date();
  visitDate.setDate(visitDate.getDate() + 3); // 3 days from now
  await prisma.visit.create({
    data: {
      dateTime: visitDate,
      status: 'AGENDADA',
      notes: 'Levar as chaves da portaria. Cliente quer ir com a esposa.',
      brokerId: broker1.id,
      clientId: client1.id,
      propertyId: prop1.id,
    },
  });

  console.log('Seeded visits...');

  // Create Contracts
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2);
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 2);

  const contract = await prisma.contract.create({
    data: {
      title: 'Contrato de Locação Residencial - Pinheiros FAB-002',
      type: 'ALUGUEL',
      status: 'ATIVO',
      value: 7500,
      startDate: startDate,
      endDate: endDate,
      signatureStatus: 'ASSINADO',
      clientSignature: 'Assinado digitalmente por João Pedro de Oliveira',
      clientId: client1.id,
      propertyId: prop2.id,
      brokerId: broker2.id,
    },
  });

  console.log('Seeded contracts...');

  // Create Transactions (Finance data)
  // Generating past months data for charts
  const categories = ['ALUGUEL', 'VENDA', 'COMISSAO', 'MARKETING', 'SALARIO', 'INFRAESTRUTURA'];
  const months = [1, 2, 3, 4, 5, 6, 7]; // Jan to Jul

  const year = new Date().getFullYear();

  for (const m of months) {
    const dueDate = new Date(year, m - 1, 10);
    // Income
    await prisma.transaction.create({
      data: {
        description: `Locação mensal FAB-002 - Mês ${m}`,
        amount: 7500,
        type: 'RECEITA',
        category: 'ALUGUEL',
        status: 'PAGO',
        dueDate: dueDate,
        paymentDate: dueDate,
        paymentMethod: 'PIX',
      },
    });

    // Commission/Sales (once or twice)
    if (m === 3 || m === 6) {
      await prisma.transaction.create({
        data: {
          description: `Venda de Imóvel Cobertura Jardins - Parcela Mês ${m}`,
          amount: 85000,
          type: 'RECEITA',
          category: 'VENDA',
          status: 'PAGO',
          dueDate: dueDate,
          paymentDate: dueDate,
          paymentMethod: 'BOLETO',
        },
      });
    }

    // Expense
    await prisma.transaction.create({
      data: {
        description: `Serviço de Marketing Digital - Mês ${m}`,
        amount: 2500,
        type: 'DESPESA',
        category: 'MARKETING',
        status: 'PAGO',
        dueDate: new Date(year, m - 1, 5),
        paymentDate: new Date(year, m - 1, 5),
        paymentMethod: 'PIX',
      },
    });

    await prisma.transaction.create({
      data: {
        description: `Folha de Pagamento - Mês ${m}`,
        amount: 15000,
        type: 'DESPESA',
        category: 'SALARIO',
        status: 'PAGO',
        dueDate: new Date(year, m - 1, 30),
        paymentDate: new Date(year, m - 1, 30),
        paymentMethod: 'TED',
      },
    });
  }

  // Pending and Overdue payments for display
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - 5);
  await prisma.transaction.create({
    data: {
      description: 'Taxa Administrativa Contrato Locação',
      amount: 450,
      type: 'RECEITA',
      category: 'OUTRO',
      status: 'ATRASADO',
      dueDate: overdueDate,
    },
  });

  const pendingDate = new Date();
  pendingDate.setDate(pendingDate.getDate() + 5);
  await prisma.transaction.create({
    data: {
      description: 'Comissão Corretor Rodrigo Silva - FAB-001',
      amount: 12000,
      type: 'DESPESA',
      category: 'COMISSAO',
      status: 'PENDENTE',
      dueDate: pendingDate,
    },
  });

  console.log('Seeded transactions...');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
