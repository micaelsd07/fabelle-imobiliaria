import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { ClientModule } from './client/client.module';
import { LeadModule } from './lead/lead.module';
import { AgendaModule } from './agenda/agenda.module';
import { ContractModule } from './contract/contract.module';
import { FinancialModule } from './financial/financial.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    PropertyModule,
    ClientModule,
    LeadModule,
    AgendaModule,
    ContractModule,
    FinancialModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
