import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  /** Uma origem por linha, ou separadas por vírgula. Ex. produção: https://app.seudominio.com */
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(/[\s,]+/)
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const allowAll = allowedOrigins.length === 1 && allowedOrigins[0] === '*';
  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (allowAll) {
        return callback(null, true);
      }
      if (!requestOrigin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, requestOrigin);
      }
      callback(new Error(`CORS: origem não permitida: ${requestOrigin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });
  console.log(`CORS: permitindo origens: ${allowAll ? '*' : allowedOrigins.join(', ')}`);
  const rawPort = process.env.PORT;
  const parsed = rawPort !== undefined ? Number(rawPort) : 3000;
  const port = Number.isFinite(parsed) && parsed > 0 ? parsed : 3000;
  await app.listen(port);
  console.log(`API em http://localhost:${port}/api/v1`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
