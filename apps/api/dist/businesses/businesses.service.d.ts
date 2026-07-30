import { PrismaService } from '../prisma/prisma.service';
export declare class BusinessesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForUser(userId: string): Promise<({
        business: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            currency: string;
        };
    } & {
        id: string;
        role: string;
        createdAt: Date;
        businessId: string;
        userId: string;
    })[]>;
    create(userId: string, data: {
        name: string;
        slug: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        currency: string;
    }>;
}
