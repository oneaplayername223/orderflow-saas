import { Body, Controller, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authService: ClientProxy) {}

  @Post('register')
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.send('register', registerUserDto);
  }

  @Post('login')
  async loginUser(@Res({ passthrough: true }) res: any, @Body() loginUserDto: LoginUserDto, @Req() req: any) {
    const ip = req.ip;
    const response = await firstValueFrom(this.authService.send('login', {...loginUserDto, ip}));
    
    const token: string = response.token;
    res.cookie('flowToken', token, { httpOnly: true });
    return response
  }
  @Post('logout')
  logoutUser(@Res({ passthrough: true }) res: any) {
    res.clearCookie('flowToken');
    return { message: 'Logged out successfully' };
  }
}
    

