# Aprenda aqui! — Plataforma de ensino de programação (MVP)

Monorepo com API **NestJS** (Prisma + MySQL), frontend **React + Vite** (Tailwind CSS, TanStack Query, Zustand) e gamificação (XP, nível, streak, gemas). A área logada do app fica em `/app` após o login; a landing pública é `/`.

## Pré-requisitos

- Node.js 18+ (recomendado 20.19+ para alinhar com as engines do Vite)
- Docker (para MySQL local) **ou** uma instância MySQL acessível

## Banco de dados

1. Suba o MySQL (porta **3307** no host, para evitar conflito com MySQL local na 3306):

   ```bash
   docker compose up -d
   ```

2. Configure a API:

   ```bash
   copy apps\api\.env.example apps\api\.env
   ```

   Ajuste `DATABASE_URL` se usar outro host/porta/usuário.

3. Aplique o schema e o seed:

   ```bash
   cd apps\api
   npx prisma db push
   npx prisma db seed
   ```

   **Bases antigas com “trilhas” (`Track` / `UserTrackEnrollment`):** faça backup e execute o script SQL em [`apps/api/prisma/manual-remove-tracks-mysql.sql`](apps/api/prisma/manual-remove-tracks-mysql.sql) no MySQL **antes** de alinhar o schema (ele copia matrículas para cursos, remove trilhas e ajusta `Course`). Em projeto novo, ignore esse arquivo.

   Em ambientes onde `prisma migrate dev` falhar por **shadow database** (usuário sem `CREATE DATABASE`), use `db push` como acima ou conceda permissões ao usuário MySQL.

## Design (Google Stitch — DevCode Journey)

A tela **“Trilha de Aprendizado”** do projeto Stitch pode ser baixada (HTML + PNG) com o SDK oficial, que usa a mesma API do servidor MCP do Stitch:

```bash
# PowerShell — defina a chave obtida em https://stitch.withgoogle.com/settings
$env:STITCH_API_KEY="sua-chave"
npm run stitch:fetch-screen
```

Isso grava `screen.html`, `screen.png` e `meta.json` em `apps/web/public/stitch-assets/devcode-journey/`. O catálogo em `/app/courses` usa o PNG como fundo opcional do hero quando o arquivo existe.

Variáveis opcionais: `STITCH_PROJECT_ID`, `STITCH_SCREEN_ID` (padrões: projeto DevCode Journey e a tela informada no fluxo Stitch).

## Executar em desenvolvimento

Na raiz do repositório:

```bash
npm install
```

Terminal 1 — API (http://localhost:3000, prefixo `/api/v1`):

```bash
npm run dev:api
```

Terminal 2 — Web (http://localhost:5173, proxy `/api` → API):

```bash
npm run dev:web
```

Abra o app, **crie uma conta** e navegue em **Cursos** → aula → exercícios (múltipla escolha, preencher código, editor JavaScript com validação no servidor).

**Catálogo público (API):** `GET /api/v1/catalog/courses` e `GET /api/v1/catalog/courses/:courseId`.

**Progresso (API):** `GET /api/v1/progress` e `POST /api/v1/progress/lessons/:lessonId/complete` (antes eram `me/progress` e `lessons/.../complete` na raiz do prefixo).

## Build de produção

```bash
npm run build
```

## Estrutura

- `apps/api` — NestJS, JWT, módulos de auth, catálogo, aulas, progresso, gamificação e submissão de exercícios.
- `apps/web` — SPA com rotas protegidas, dashboard, catálogo de cursos, aulas em Markdown e Monaco Editor.
- `docker-compose.yml` — MySQL 8 para desenvolvimento local.

## Variáveis de ambiente (API)

| Variável       | Descrição                          |
|----------------|-------------------------------------|
| `DATABASE_URL` | URL MySQL (Prisma)                  |
| `JWT_SECRET`   | Segredo para assinatura de JWT      |
| `PORT`         | Porta HTTP (padrão 3000)            |
| `CORS_ORIGIN`  | Origem do front (padrão Vite 5173) |

O frontend usa por padrão o proxy do Vite (`/api` → `localhost:3000`). Para outro host de API, defina `VITE_API_BASE` no build do web (por exemplo `https://api.exemplo.com/api/v1`).

## Segurança e limitações (MVP)

- **Rate limiting:** os endpoints `POST /auth/login` e `POST /auth/register` compartilham um limite por IP (Throttler no controller de auth). Ajuste em [`apps/api/src/auth/auth.controller.ts`](apps/api/src/auth/auth.controller.ts) se necessário.
- **Helmet:** cabeçalhos HTTP básicos são aplicados em [`apps/api/src/main.ts`](apps/api/src/main.ts) (`crossOriginResourcePolicy` liberado para o SPA em dev).
- **Conteúdo pago:** matrícula em cursos com `isFree: false` é bloqueada na API; o catálogo ainda pode listá-los — use política de exibição no front se for o caso.
- **Aulas e exercícios:** exige matrícula no curso da aula. No login/registro, a API matricula o usuário automaticamente em todos os cursos gratuitos existentes (e preenche lacunas em logins futuros).
- **Execução de código (exercícios JS):** a avaliação usa `vm` do Node com timeout curto; **não é sandbox de produção forte**. Para ambiente público agressivo, avalie isolamento adicional (worker, serviço externo, etc.).
