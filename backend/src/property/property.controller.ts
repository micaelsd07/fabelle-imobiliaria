import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.propertyService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.propertyService.create(body);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.propertyService.update(id, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    return this.propertyService.duplicate(id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/archive')
  async archive(@Param('id') id: string) {
    return this.propertyService.archive(id);
  }
}
