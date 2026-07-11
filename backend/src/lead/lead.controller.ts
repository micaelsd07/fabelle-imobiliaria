import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { LeadService } from './lead.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('leads')
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.leadService.findAll(query);
  }

  @Get('stats')
  async getStats() {
    return this.leadService.getFunnelStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.leadService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.leadService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.leadService.remove(id);
  }

  @Post(':id/history')
  async addHistory(
    @Param('id') id: string,
    @Body() body: { type: string; content: string },
    @Req() req: any,
  ) {
    return this.leadService.addHistory(id, body.type, body.content, req.user.sub);
  }
}
