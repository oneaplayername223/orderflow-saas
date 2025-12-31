import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

    @MessagePattern('login-succeeded-mail')
    loginSucceeded(data: any) {
      return this.mailService.loginSucceeded(data);
    }

    @MessagePattern('register-succeeded-mail')
    registerSucceeded(data: any) {
      return this.mailService.registerSucceeded(data);
    }
  
}
