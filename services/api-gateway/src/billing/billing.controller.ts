import { Controller, Inject, Post, Get, Body, Query } from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';

@Controller('billing')
export class BillingController {
  constructor(@Inject('BILLING_SERVICE') private readonly billingClient: ClientProxy) {}

  @Post('create')
  async createBilling(@Body() chargeDto: any) {
    return this.billingClient.send('create-billing', chargeDto);
  }

  @Get()
  async getBilling(@Query('accountId') accountId: number) {
    return this.billingClient.send('get-billing', { accountId });
  }
}
