import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [ProductModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
