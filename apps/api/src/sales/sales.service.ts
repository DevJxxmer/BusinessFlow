import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.sale.findMany({
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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOneForUser(saleId: string, userId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: saleId,
        business: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return sale;
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
    customerName: string;
    paymentMethod: string;
    subtotal: number;
    total: number;
    discount?: number;
    notes?: string;
    items?: Array<{ productId: string; quantity: number; unitPrice: number; total: number }>;
  }) {
    return this.prisma.sale.create({
      data: {
        businessId: data.businessId,
        customerName: data.customerName,
        paymentMethod: data.paymentMethod,
        subtotal: data.subtotal,
        total: data.total,
        discount: data.discount ?? 0,
        notes: data.notes,
        items: data.items
          ? {
              create: data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(saleId: string, userId: string, data: {
    customerName?: string;
    paymentMethod?: string;
    subtotal?: number;
    total?: number;
    discount?: number;
    notes?: string;
  }) {
    await this.findOneForUser(saleId, userId);

    return this.prisma.sale.update({
      where: { id: saleId },
      data,
    });
  }

  async remove(saleId: string, userId: string) {
    await this.findOneForUser(saleId, userId);
    return this.prisma.sale.delete({ where: { id: saleId } });
  }
}
