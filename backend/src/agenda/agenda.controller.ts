import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private agendaService: AgendaService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.agendaService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.agendaService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.agendaService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.agendaService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.agendaService.remove(id);
  }
}
