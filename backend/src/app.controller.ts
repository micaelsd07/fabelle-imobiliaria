import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Health check para Render/Fly.io e monitores externos
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(AuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.appService.getDashboardStats();
  }
}
