import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from './filters/rpc.filter';
import { ConfigService } from '@nestjs/config';
import cookieparser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(cookieparser())
    app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new RpcExceptionFilter());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  
  const logger = new Logger('NestApplication');
  logger.log(`API Gateway listening on port ${port}`);
}
bootstrap();
