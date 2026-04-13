import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({ origin, credentials: true });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API em http://localhost:${port}/api/v1`);
}
bootstrap();
