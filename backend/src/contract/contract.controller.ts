import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('contracts')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Get()
  async findAll() {
    return this.contractService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.contractService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.contractService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }

  @Post(':id/sign')
  async signContract(
    @Param('id') id: string,
    @Body() body: { signature: string },
  ) {
    return this.contractService.signContract(id, body.signature);
  }
}
