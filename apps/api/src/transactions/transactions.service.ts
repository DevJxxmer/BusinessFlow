import { Injectable } from '@nestjs/common';
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
}
