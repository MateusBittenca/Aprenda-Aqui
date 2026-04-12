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

   Em ambientes onde `prisma migrate dev` falhar por **shadow database** (usuário sem `CREATE DATABASE`), use `db push` como acima ou conceda permissões ao usuário MySQL.

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

Abra o app, **crie uma conta** e navegue em **Trilhas** → aula → exercícios (múltipla escolha, preencher código, editor JavaScript com validação no servidor).

## Build de produção

```bash
npm run build
```

## Estrutura

- `apps/api` — NestJS, JWT, módulos de auth, catálogo, aulas, progresso, gamificação e submissão de exercícios.
- `apps/web` — SPA com rotas protegidas, dashboard, trilhas, aulas em Markdown e Monaco Editor.
- `docker-compose.yml` — MySQL 8 para desenvolvimento local.

## Variáveis de ambiente (API)

| Variável       | Descrição                          |
|----------------|-------------------------------------|
| `DATABASE_URL` | URL MySQL (Prisma)                  |
| `JWT_SECRET`   | Segredo para assinatura de JWT      |
| `PORT`         | Porta HTTP (padrão 3000)            |
| `CORS_ORIGIN`  | Origem do front (padrão Vite 5173) |

O frontend usa por padrão o proxy do Vite (`/api` → `localhost:3000`). Para outro host de API, defina `VITE_API_BASE` no build do web (por exemplo `https://api.exemplo.com/api/v1`).
