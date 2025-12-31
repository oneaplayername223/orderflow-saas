import { Controller, Inject, Post, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('notifications')
export class NotificationsController {
  constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy) {}

  @Post('send')
  async sendNotification(@Body() data: any) {
    return this.notificationService.send('sendMail', data);
  }
}
