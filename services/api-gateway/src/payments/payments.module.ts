import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PAYMENTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string || 'amqp://rabbitmq:5672'],
          queue: 'payments_queue',
        },
      },
        {
        name: 'PDF_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string || 'amqp://rabbitmq:5672'],
          queue: 'pdf_queue',
        },
        
      },
    ])
  ],
  controllers: [PaymentsController],
  providers: [],
})
export class PaymentsModule {}
