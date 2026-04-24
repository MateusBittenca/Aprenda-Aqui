# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# VITE_API_BASE vem do apps/web/.env.production (commitado no repo).
# Vite lê automaticamente .env.production no build de produção.

# Copia manifestos do workspace (root + app)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Instala dependências do workspace web
RUN npm ci --workspace=apps/web --include-workspace-root

# Copia o código-fonte do frontend
COPY apps/web ./apps/web

# Build de produção (Vite injeta VITE_API_BASE no bundle)
RUN npm run build -w apps/web

# ─── Stage 2: Servir com nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copia os arquivos buildados
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copia a configuração nginx com suporte a SPA routing
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
