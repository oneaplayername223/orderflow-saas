import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('checkout-payment')
  async checkoutPayment(data: any) {
    return this.paymentsService.checkoutPayment(data);
  }

  
}
