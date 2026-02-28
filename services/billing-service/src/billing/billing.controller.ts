import { Controller } from '@nestjs/common';
import { BillingService } from './billing.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateBillingDto } from './dto/create-billing.dto';
import { GetBillingDto } from './dto/get-billing.dto';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @MessagePattern('create-billing')
  async chargeCustomer(chargeDto: CreateBillingDto) {
    return {
      success: await this.billingService.createBilling(chargeDto),
    }
  }

  @MessagePattern('get-billing')
  async getBilling(accountId: GetBillingDto) {
    return {
      success: await this.billingService.getBilling(accountId),
    }
  }
}
