import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, @Inject('AUTH_SERVICE') private readonly authService: ClientProxy) {}

async createUser(data: number) {
const accountId = data
const role = 'ADMIN'
const status = 'ACTIVE'
return this.prisma.user.create({ data: { accountId, role, status } });
}

async getUser(data: number) {
  const accountId = Number(data)
  const query = await this.prisma.user.findUnique({ where: { accountId } });
  const role = String(query?.role)
  const status = String(query?.status)
  return {role, status};
}

async getUserProfile(data: number) {
  const accountId = Number(data)
  const usersService = await firstValueFrom(this.authService.send('get-user', accountId));
  const query = await this.prisma.user.findUnique({ where: { accountId } });
  const role = String(query?.role)
  const status = String(query?.status)
  const email = usersService.query.email
  const username = usersService.query.username
  const company_name = usersService.query.company_name
  return {role, status, company_name, email, username};

  }
}
