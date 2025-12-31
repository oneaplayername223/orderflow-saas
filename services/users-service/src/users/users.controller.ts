import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('create-user')
  createUser(data: any) {
    return this.usersService.createUser(data);
  }

  @MessagePattern('get-user')
  async getUser(data: any) {
    const query = await this.usersService.getUser(data);
    return query
  }

  @MessagePattern('user-profile')
  userProfile(data: any) {
    return this.usersService.getUserProfile(data);
  }

}
