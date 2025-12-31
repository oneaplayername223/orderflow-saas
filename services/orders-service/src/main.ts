import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcFilter } from './filters/rpc/rpc.filter';

async function bootstrap() {
   const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
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
