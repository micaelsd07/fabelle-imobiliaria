import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    type?: string;
    category?: string;
    status?: string;
    bedrooms?: string;
    suites?: string;
    garageSlots?: string;
    minPrice?: string;
    maxPrice?: string;
    city?: string;
    neighborhood?: string;
    featured?: string;
  }) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.neighborhood) where.neighborhood = { contains: query.neighborhood, mode: 'insensitive' };

    if (query.bedrooms) where.bedrooms = { gte: parseInt(query.bedrooms) };
    if (query.suites) where.suites = { gte: parseInt(query.suites) };
    if (query.garageSlots) where.garageSlots = { gte: parseInt(query.garageSlots) };

    if (query.featured) where.featured = query.featured === 'true';

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    const properties = await this.prisma.property.findMany({
      where,
      include: this.propertyInclude,
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((property) => this.toResponse(property));
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: this.propertyInclude,
    });
    if (!property) {
      throw new NotFoundException('Imovel nao encontrado.');
    }
    return this.toResponse(property);
  }

  async create(data: any) {
    const { data: propertyData, photos } = this.extractPhotoPayload(data);

    if (!propertyData.code) {
      const count = await this.prisma.property.count();
      propertyData.code = `FAB-${(count + 1).toString().padStart(3, '0')}`;
    }

    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
        photoItems: this.toNestedCreate(photos),
      },
      include: this.propertyInclude,
    });

    return this.toResponse(property);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const { data: propertyData, photos } = this.extractPhotoPayload(data);

    const property = await this.prisma.$transaction(async (tx) => {
      if (photos !== undefined) {
        await tx.propertyPhoto.deleteMany({ where: { propertyId: id } });
      }

      return tx.property.update({
        where: { id },
        data: {
          ...propertyData,
          ...(photos !== undefined ? { photoItems: this.toNestedCreate(photos) } : {}),
        },
        include: this.propertyInclude,
      });
    });

    return this.toResponse(property);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.property.delete({ where: { id } });
  }

  async duplicate(id: string) {
    const original = await this.prisma.property.findUnique({
      where: { id },
      include: this.propertyInclude,
    });
    if (!original) throw new NotFoundException('Imovel nao encontrado.');

    const count = await this.prisma.property.count();
    const newCode = `FAB-${(count + 1).toString().padStart(3, '0')}`;

    const { id: _, code: __, createdAt: ___, updatedAt: ____, broker: _____, photoItems, contracts, visits, ...dataToCopy } = original as any;
    const photos = this.photoUrls(original);

    const property = await this.prisma.property.create({
      data: {
        ...dataToCopy,
        code: newCode,
        title: `${original.title} (Copia)`,
        status: 'DISPONIVEL',
        photos: photos.join(','),
        photoItems: this.toNestedCreate(photos),
      },
      include: this.propertyInclude,
    });

    return this.toResponse(property);
  }

  async archive(id: string) {
    await this.findOne(id);
    const property = await this.prisma.property.update({
      where: { id },
      data: { status: 'ARQUIVADO' },
      include: this.propertyInclude,
    });
    return this.toResponse(property);
  }

  private propertyInclude = {
    broker: {
      select: { id: true, name: true, phone: true, email: true, photo: true },
    },
    photoItems: {
      orderBy: { sortOrder: 'asc' as const },
    },
  };

  private extractPhotoPayload(input: any): { data: any; photos?: string[] } {
    const data = { ...input };
    const rawPhotos = data.photos;
    delete data.photoItems;

    if (rawPhotos === undefined) return { data };

    const photos = this.normalizePhotos(rawPhotos);
    data.photos = photos.join(',');
    return { data, photos };
  }

  private normalizePhotos(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'string' ? item : (item as any)?.url)).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map((url) => url.trim()).filter(Boolean);
    }
    return [];
  }

  private toNestedCreate(photos?: string[]) {
    if (!photos || photos.length === 0) return undefined;
    return {
      create: photos.map((url, index) => ({
        url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    };
  }

  private photoUrls(property: any): string[] {
    const related = Array.isArray(property.photoItems)
      ? property.photoItems.map((photo: any) => photo.url).filter(Boolean)
      : [];
    return related.length > 0 ? related : this.normalizePhotos(property.photos);
  }

  private toResponse(property: any) {
    const photos = this.photoUrls(property);
    return {
      ...property,
      photos: photos.join(','),
    };
  }
}