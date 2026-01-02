import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
async function bootstrap() {
  const logger = new Logger('Microservice-Notification');
  dotenv.config();
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: 'notifications_queue',
    },
  });
  await app.listen();

  logger.log(`Microservice-Notification listening`);
}
bootstrap();
