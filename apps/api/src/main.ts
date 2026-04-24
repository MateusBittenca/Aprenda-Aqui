import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  /**
   * CORS antes do Helmet — evita que headers de segurança interfiram no preflight (OPTIONS).
   * Aspas em CORS_ORIGIN (comum ao colar no Railway) são removidas.
   */
  const rawCors = process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173';
  const allowedOrigins = rawCors
    .split(/[\s,]+/)
    .map((o) => o.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, ''))
    .filter(Boolean);
  const allowAll = allowedOrigins.length === 1 && allowedOrigins[0] === '*';
  const originConfig =
    allowAll ? true : allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173'];
  app.enableCors({
    origin: originConfig,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  });
  const corsLog = allowAll
    ? '*(refletir)'
    : Array.isArray(originConfig)
      ? originConfig.join(', ')
      : String(originConfig);
  console.log(`CORS: CORS_RAW_LEN=${rawCors.length} | permitindo: ${corsLog}`);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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
