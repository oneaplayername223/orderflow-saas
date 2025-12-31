import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('register')
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern('login')
  async loginUser(@Payload() loginUserDto: LoginUserDto) {
    
    return await this.authService.loginUser(loginUserDto);
    
  }

  @MessagePattern('get-user')
  async userProfile(@Payload() data: number) {
    
    return await this.authService.getUserProfile(data);
  }
  
}
