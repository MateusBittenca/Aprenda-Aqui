# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# VITE_API_BASE must be set as an environment variable in Railway so that
# it is forwarded as a Docker build ARG and injected into the Vite bundle.
# Railway passes env vars as build args when the ARG is declared here.
# Default points to the production API; override via Railway's env var panel.
ARG VITE_API_BASE=https://aprenda-aqui.up.railway.app/api/v1
ENV VITE_API_BASE=$VITE_API_BASE

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
