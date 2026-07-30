import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BusinessesService } from './businesses.service';

@ApiTags('businesses')
@ApiBearerAuth()
@Controller('businesses')
@UseGuards(AuthGuard('jwt'))
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  list(@Req() req: any) {
    return this.businessesService.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() body: { name: string; slug: string }) {
    return this.businessesService.create(req.user.userId, body);
  }
}
