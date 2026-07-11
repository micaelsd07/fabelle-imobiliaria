import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.financialService.findAll(query);
  }

  @Get('metrics')
  async getMetrics() {
    return this.financialService.getMetrics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.financialService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.financialService.create({ ...body, createdById: req.user.sub });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.financialService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.financialService.remove(id);
  }
}
