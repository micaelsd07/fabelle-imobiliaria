import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {}
