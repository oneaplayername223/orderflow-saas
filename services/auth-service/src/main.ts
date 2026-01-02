import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from './filters/rpc/rpc.filter';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: 'auth_queue',
    }
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllRpcExceptionsFilter());
  await app.listen();

  const logger = new Logger('AuthMicroservice');
  logger.log(`Auth Microservice listening`);
}
bootstrap();
