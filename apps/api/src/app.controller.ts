import { Controller, Get } from '@nestjs/common';

/**
 * Rotas fora do prefixo global `api/v1` — úteis para health check e para não ver 404 ao abrir a raiz no navegador (ex.: ngrok).
 */
@Controller()
export class AppController {
  @Get()
  root() {
    return {
      ok: true,
      service: 'codepath-api',
      hint: 'Endpoints REST estão sob /api/v1 (ex.: POST /api/v1/auth/login).',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
