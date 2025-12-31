import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [NotificationsModule, MailModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
