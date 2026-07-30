import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.businessMember.findMany({
      where: { userId },
      include: { business: true },
    });
  }

  async create(userId: string, data: { name: string; slug: string }) {
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      await tx.businessMember.create({
        data: {
          businessId: business.id,
          userId,
          role: 'ADMIN',
        },
      });

      return business;
    });
  }
}
