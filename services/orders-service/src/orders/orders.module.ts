import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';
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
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string || 'amqp://rabbitmq:5672'],
          queue: 'notifications_queue',
        },
      },

    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
