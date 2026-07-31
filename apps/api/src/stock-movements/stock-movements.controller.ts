import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StockMovementsService } from './stock-movements.service';

@ApiTags('stock-movements')
@ApiBearerAuth()
@Controller('stock-movements')
@UseGuards(JwtAuthGuard)
export class StockMovementsController {
  constructor(private stockMovementsService: StockMovementsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.stockMovementsService.listForUser(req.user.userId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      productId: string;
      type: 'ENTRY' | 'EXIT';
      quantity: number;
    },
  ) {
    const businessId = await this.stockMovementsService.getDefaultBusinessIdForUser(req.user.userId);

    return this.stockMovementsService.create({
      businessId,
      productId: body.productId,
      type: body.type,
      quantity: body.quantity,
    });
  }
}
