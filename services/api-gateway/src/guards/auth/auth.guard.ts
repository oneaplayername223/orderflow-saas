import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class AuthGuard implements CanActivate {
   async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
    const request = context.switchToHttp().getRequest();
    
    const token = request.cookies?.flowToken

    if (!token) throw new NotFoundException('Token not found')
      
    try {
    const decode = jwt.verify(token, process.env.HASH_SECRET_KEY as string);
    if (decode){ 
     request.user = decode
      return true
    }
    } catch (error) {
      throw new NotFoundException('Token not found')
    }
    throw new UnauthorizedException('Unauthorized');
  }
  
}
