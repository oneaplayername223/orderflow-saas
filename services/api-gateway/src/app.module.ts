import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { config } from 'dotenv';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, NotificationsModule, PaymentsModule, UsersModule, OrdersModule, 
    ConfigModule.forRoot ({
      envFilePath: '.env',
      isGlobal: true
    })],
  controllers: [],
  providers: [],
})
export class AppModule {}
