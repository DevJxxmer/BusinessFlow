import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.product.findMany({
      where: {
        business: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(productId: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        business: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async getDefaultBusinessIdForUser(userId: string) {
    const membership = await this.prisma.businessMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!membership) {
      throw new NotFoundException('No business found for user');
    }

    return membership.businessId;
  }

  async create(data: {
    businessId: string;
    name: string;
    sku: string;
    purchasePrice: number;
    salePrice: number;
    initialStock: number;
    minimumStock: number;
    category?: string;
    supplier?: string;
    status?: string;
  }) {
    return this.prisma.product.create({ data });
  }

  async update(productId: string, userId: string, data: {
    name?: string;
    sku?: string;
    purchasePrice?: number;
    salePrice?: number;
    initialStock?: number;
    minimumStock?: number;
    category?: string;
    supplier?: string;
    status?: string;
  }) {
    await this.findOneForUser(productId, userId);

    return this.prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async remove(productId: string, userId: string) {
    await this.findOneForUser(productId, userId);
    return this.prisma.product.delete({ where: { id: productId } });
  }
}
