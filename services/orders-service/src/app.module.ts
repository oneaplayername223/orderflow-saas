import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { PrismaService } from './orders/prisma/prisma.service';


@Module({
  imports: [OrdersModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
