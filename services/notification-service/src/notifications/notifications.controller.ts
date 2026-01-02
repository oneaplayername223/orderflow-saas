import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}


  @MessagePattern('register-notification')
  registerNotification(data: any) {
    return this.notificationsService.registerNotification(data);
  }

  @MessagePattern('login-notification')
  loginNotification(data: any) {
    return this.notificationsService.loginNotification(data);
  }

  @MessagePattern('login-failed-notification')
  loginFailedNotification(data: any) {
    return this.notificationsService.loginFailedNotification(data);
  }

  @MessagePattern('payment-created-notification')
  paymentCreated(data: any) {
    return this.notificationsService.paymentCreated(data);
  }

  @MessagePattern('payment-failed-notification')
  paymentFailed(data: any) {
    return this.notificationsService.paymentFailed(data);
  }
  
  @MessagePattern('order-confirmed-notification')
  orderConfirmed(data: any){
    return this.notificationsService.orderConfirmed(data)
  }
}
