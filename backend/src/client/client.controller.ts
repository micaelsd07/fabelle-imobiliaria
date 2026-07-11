import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get()
  async findAll(@Query('search') search?: string, @Query('type') type?: string) {
    return this.clientService.findAll(search, type);
  }

  @Get('owners')
  async findOwners(@Query('search') search?: string) {
    return this.clientService.findOwners(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.clientService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.clientService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
