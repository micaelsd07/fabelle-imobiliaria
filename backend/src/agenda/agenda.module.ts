import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AgendaService],
  controllers: [AgendaController],
  exports: [AgendaService],
})
export class AgendaModule {}
