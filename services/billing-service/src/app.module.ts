import { Module } from '@nestjs/common';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [BillingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
