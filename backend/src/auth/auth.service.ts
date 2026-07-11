import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 min

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    creci?: string;
    phone?: string;
    whatsapp?: string;
    photo?: string;
    commissionRate?: number;
    salesMeta?: number;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado no sistema.');
    }

    const { password, ...rest } = data;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { ...rest, passwordHash },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas ou conta inativa.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = await this.jwtService.signAsync(payload);

    const { passwordHash: _, ...userInfo } = user;
    return { accessToken: token, user: userInfo };
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async listAllUsers() {
    const users = await this.prisma.user.findMany({ orderBy: { name: 'asc' } });
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  async updateUser(id: string, data: any) {
    const patch: any = { ...data };
    if (patch.password) {
      patch.passwordHash = await bcrypt.hash(patch.password, SALT_ROUNDS);
      delete patch.password;
    }
    const user = await this.prisma.user.update({ where: { id }, data: patch });
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Gera um token de reset e persiste apenas o hash.
   * Retorna sempre a mesma resposta (sem enumerar quais e-mails existem).
   * Em dev, o link vai pro console. Em prod, plugar um serviço de e-mail aqui.
   */
  async requestPasswordReset(email: string): Promise<{ ok: true; devLink?: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.active) {
      // Invalida resets pendentes anteriores
      await this.prisma.passwordReset.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await this.prisma.passwordReset.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3002').split(',')[0].trim();
      const link = `${frontendUrl}/recuperar/${rawToken}`;

      // Dev-mode: log the link. Substituir por nodemailer/etc em produção.
      console.log('\n=== PASSWORD RESET ===');
      console.log(`Usuário: ${user.email}`);
      console.log(`Link (válido por 30min): ${link}`);
      console.log('======================\n');

      if (process.env.NODE_ENV !== 'production') {
        return { ok: true, devLink: link };
      }
    }

    // Sempre 200 pra não vazar existência de e-mail
    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ ok: true }> {
    const tokenHash = hashToken(token);
    const record = await this.prisma.passwordReset.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true };
  }
}
