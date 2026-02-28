import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [BillingController],
  providers: [
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
    BillingService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
