import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.flowToken;

    // Excepción para métricas
    if (request.path === '/api/metrics') {
      return true;
    }

    if (!token) throw new NotFoundException('Token not found');

    try {
      const decode = jwt.verify(token, process.env.HASH_SECRET_KEY as string) as any;
      if (decode) {
        request.user = decode;
        
        if (decode.createdAt >= decode.expireAt) {
          throw new UnauthorizedException('Billing expired');
        }

        // Aquí validas el tipo de usuario
        const allowedRoles = this.getAllowedRoles(context);
        if (!allowedRoles || allowedRoles.includes(decode.accountType)) {
          return true;
        } else {
          throw new UnauthorizedException('Role not allowed');
        }
      }
    } catch (error) {
      throw new NotFoundException('Token not found');
    }
    throw new UnauthorizedException('Unauthorized');
  }

  private getAllowedRoles(context: ExecutionContext): string[] | null {
    const handler = context.getHandler();
    const roles = Reflect.getMetadata('roles', handler);
    return roles || null;
  }
}
