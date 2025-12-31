import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { SendMailService } from '../notifications/mail/send-mail.utils';
@Module({
  
  controllers: [MailController],
  providers: [MailService, SendMailService],
  
})
export class MailModule {}
