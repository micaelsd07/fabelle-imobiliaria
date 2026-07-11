import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PropertyService],
  controllers: [PropertyController],
  exports: [PropertyService],
})
export class PropertyModule {}
