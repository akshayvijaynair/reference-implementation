import { NestFactory } from '@nestjs/core';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import * as fs from 'fs';
import * as morgan from 'morgan';
import { AppModule } from './app.module';


const logStream = fs.createWriteStream('api.log', {
  flags: 'a', // append
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(morgan('tiny', { stream: logStream }));
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,    // Remove properties that do not have decorators
        forbidNonWhitelisted: true, // Throw an error if there are extra properties
        transform: true,    // Automatically transform payloads to DTO instances
        exceptionFactory: (errors) => {
          return new BadRequestException(errors);
        },
      }),
  );
  await app.listen(3000);
}
bootstrap();
