import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from './prisma/prisma.service';
import bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import jwt from 'jsonwebtoken';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, 
    @Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersService: ClientProxy
  ) {}
    async registerUser(registerUserDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const query = await this.prisma.account.create({ data: {  ...registerUserDto, password: hashedPassword, } });
    this.notificationService.emit('register-notification', registerUserDto);
    await this.usersService.emit('create-user', query.id);
    return {
      message: 'User registered successfully',
    };

  
}
  
async loginUser(loginUserDto: LoginUserDto) {
  const ip = loginUserDto['ip'];
  console.log('IP Address:', ip);
    const username = loginUserDto.username;
    const user = await this.prisma.account.findFirst({
      where: { username: username },
    });
  
    if (!user) {
      throw new RpcException('Invalid username');
    }
  
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new RpcException('Invalid password');
    }
    const usersService = await firstValueFrom(this.usersService.send('get-user', user.id));
    await firstValueFrom(this.notificationService.emit('login-notification', {...user, ip}));

    const {role, status} = usersService
    if (status !== 'ACTIVE') {
      this.notificationService.emit('login-failed-notification', user);
      throw new RpcException('User is not active');
    }
    //I didn't create a refreshToken because I don't feel like it
    const token = await jwt.sign({ accountId: user.id, userId: user.userId, role: role, status: status}, process.env.HASH_SECRET_KEY as string, { expiresIn: '7d' });
    return {
      message: 'User logged in successfully',
      token
          
    };
  }

  async getUserProfile(accountId: number) {
    const query = await this.prisma.account.findUnique({ where: { id: accountId }, 
    select: { company_name: true, email: true, username: true} });
    
    return {query};
  }

}
