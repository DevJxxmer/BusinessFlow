import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        business: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, data: { type: string; category: string; description: string; amount: number; date?: string }) {
    const businessId = await this.getDefaultBusinessIdForUser(userId);

    return this.prisma.transaction.create({
      data: {
        businessId,
        type: data.type,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async getDefaultBusinessIdForUser(userId: string) {
    const membership = await this.prisma.businessMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership) {
      throw new NotFoundException('No business found for user');
    }

    return membership.businessId;
  }
}
