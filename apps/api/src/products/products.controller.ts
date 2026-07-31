import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.productsService.listForUser(req.user.userId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      businessId?: string;
      name: string;
      sku: string;
      purchasePrice: number;
      salePrice: number;
      initialStock: number;
      minimumStock: number;
      category?: string;
      supplier?: string;
      status?: string;
    },
  ) {
    const businessId = body.businessId ?? (await this.productsService.getDefaultBusinessIdForUser(req.user.userId));

    return this.productsService.create({
      businessId,
      ...body,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      sku?: string;
      purchasePrice?: number;
      salePrice?: number;
      initialStock?: number;
      minimumStock?: number;
      category?: string;
      supplier?: string;
      status?: string;
    },
  ) {
    return this.productsService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.productsService.remove(id, req.user.userId);
  }
}
