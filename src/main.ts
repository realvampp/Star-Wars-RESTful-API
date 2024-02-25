import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HandleResponseInterceptor } from './pagination/handle-response/handle-response.interceptor'
import { AllExceptionFilter } from './all-exception/all-exception.filter'
import { getSaveEnv } from './utils'
import {
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = getSaveEnv('PORT', '3000')
  // const { httpAdapter } = app.get(HttpAdapterHost)

  app
    .setGlobalPrefix('api')
    .useGlobalInterceptors(new HandleResponseInterceptor())
    .useGlobalFilters(new AllExceptionFilter())
    .useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          const errorMessage = validationErrors
            .map((error) => {
              return `${error.property} has wrong value ${
                error.value
                // @ts-ignore
              } ${Object.values(error.constraints).join(', ')}`
            })
            .join(', ')

          return new UnprocessableEntityException(errorMessage)
        },
      }),
    )
  const config = new DocumentBuilder()
    .setTitle('Star wars API')
    .setDescription('Backend project')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/swagger', app, document)

  await app.listen(port, () => {
    Logger.log(`Server is running on ${port} port`)
  })
}

bootstrap()
