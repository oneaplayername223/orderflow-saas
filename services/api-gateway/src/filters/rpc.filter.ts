import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const message =
      typeof exception === 'string'
        ? exception
        : exception?.message ?? exception?.response?.message ?? 'Microservice error';

    response.status(HttpStatus.BAD_REQUEST).json({
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
