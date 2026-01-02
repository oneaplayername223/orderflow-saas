import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcFilter } from './filters/rpc/rpc.filter';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
   const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: 'orders_queue',
    }
  });
  const logger = new Logger('MicroserviceOrders');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new RpcFilter());
  await app.listen();

  logger.log(`Orders Microservice listening`);
}
bootstrap();
