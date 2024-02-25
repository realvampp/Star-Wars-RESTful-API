import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { getSaveEnv } from '../utils'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    const env = getSaveEnv('NODE_ENV')

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const body = {
      statusCode: status,
      error:
        env !== '' && env !== 'production'
          ? exception.message
          : 'Something went wrong :(',
      path: request.url,
      timestamp: new Date().toISOString(),
    }

    response.status(status).json(body)
  }
}
