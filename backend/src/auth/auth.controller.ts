import { Controller, Post, Get, Body, Req, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Roles, RolesGuard } from './roles.guard';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  // 5 tentativas de login por minuto por IP
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('auth/login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // Recuperação de senha — throttle mais rigoroso pra evitar spam/enum
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('auth/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('auth/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('auth/profile')
  async getProfile(@Req() req: any) {
    return this.authService.findUserById(req.user.sub);
  }

  // User Management CRUD (Admin/Gerente)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Get('users')
  async listUsers() {
    return this.authService.listAllUsers();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Post('users')
  async createUser(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.authService.updateUser(id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
