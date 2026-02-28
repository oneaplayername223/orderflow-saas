import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  controllers: [BillingController],
  providers: [],
  imports: [
    ClientsModule.register([
      {
        name: 'BILLING_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'billing_queue',
          queueOptions: {
            durable: true
          },
        }
      }
    ])
  ]
})

export class BillingModule {}
