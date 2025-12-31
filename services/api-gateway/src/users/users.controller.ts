import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '../guards/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly usersService: ClientProxy) {}

@UseGuards(AuthGuard)
@Get('profile')
  userProfile(@Req() req: any) {
    const accountId = req.user?.accountId
    return this.usersService.send('user-profile', accountId);
  }

}
