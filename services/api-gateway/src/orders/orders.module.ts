import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
 imports: [
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string || 'amqp://rabbitmq:5672'],
          queue: 'orders_queue',
        
        },
      },
    ])
  ],
  controllers: [OrdersController],
  providers: [],
})
export class OrdersModule {}
