import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : { error: (exception as any)?.message ?? String(exception) };
    console.error('[AllExceptions]', (exception as any)?.message, (exception as any)?.stack?.substring(0, 500));
    res.status(status).json(typeof message === 'string' ? { message } : message);
  }
}
