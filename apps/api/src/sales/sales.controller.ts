import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalesService } from './sales.service';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.salesService.listForUser(req.user.userId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      businessId?: string;
      customerName: string;
      paymentMethod: string;
      subtotal: number;
      total: number;
      discount?: number;
      notes?: string;
      items?: Array<{ productId: string; quantity: number; unitPrice: number; total: number }>;
    },
  ) {
    const businessId = body.businessId ?? (await this.salesService.getDefaultBusinessIdForUser(req.user.userId));

    return this.salesService.create({
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
      customerName?: string;
      paymentMethod?: string;
      subtotal?: number;
      total?: number;
      discount?: number;
      notes?: string;
    },
  ) {
    return this.salesService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.salesService.remove(id, req.user.userId);
  }
}
