# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copia manifestos do workspace (root + app)
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Instala apenas as deps do workspace da API (inclui devDeps para compilar)
RUN npm ci --workspace=apps/api --include-workspace-root

# Copia o código-fonte da API
COPY apps/api ./apps/api

# Gera o Prisma Client
RUN npx --yes prisma generate --schema=apps/api/prisma/schema.prisma

# Compila o NestJS
RUN npm run build -w apps/api

# ─── Stage 2: Produção ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário para rodar
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Instala somente dependências de produção
RUN npm ci --workspace=apps/api --include-workspace-root --omit=dev

# Copia binários compilados
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copia schema + migrations (necessário para o prisma migrate deploy)
COPY apps/api/prisma ./apps/api/prisma

# Copia o Prisma Client gerado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Railway injeta PORT automaticamente; fallback 3000
EXPOSE 3000

# Executa as migrations pendentes e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/main"]
