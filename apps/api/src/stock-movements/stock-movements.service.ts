import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.stockMovement.findMany({
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
        product: true,
      },
    });
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
    productId: string;
    type: 'ENTRY' | 'EXIT';
    quantity: number;
  }) {
    return this.prisma.stockMovement.create({
      data,
      include: {
        product: true,
      },
    });
  }
}
