import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PAYMENTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'payments_queue',
        },
      },
    ])
  ],
  controllers: [PaymentsController],
  providers: [],
})
export class PaymentsModule {}
