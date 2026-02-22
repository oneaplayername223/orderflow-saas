import { Module } from '@nestjs/common';
import { PdfsController } from './pdfs.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PDF_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as unknown as string],
          queue: 'pdf_queue',
      }
      },
    ]),
  ],
  controllers: [PdfsController],
  providers: [],
})
export class PdfsModule {}
