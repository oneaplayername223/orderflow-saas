import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: 'billing_queue',
      queueOptions: {
        durable: true,
      }
    }
  });

  const logger = new Logger('billing-service');
  await app.startAllMicroservices();

  // read port from env, fall back to 3008 for local runs
  const port = parseInt(process.env.PORT || '3008', 10);
  await app.listen(port);

  logger.log(`Billing Microservice listening on port ${port}`);
}
bootstrap();
