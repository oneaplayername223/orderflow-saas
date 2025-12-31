import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(@Inject('PAYMENTS_SERVICE') private readonly paymentsService: ClientProxy) {}


  
}
