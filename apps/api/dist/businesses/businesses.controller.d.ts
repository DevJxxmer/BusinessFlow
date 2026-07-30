import { BusinessesService } from './businesses.service';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    list(req: any): Promise<({
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
    create(req: any, body: {
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
