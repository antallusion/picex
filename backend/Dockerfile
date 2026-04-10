# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production backend with Puppeteer + built frontend ────────────────
FROM node:18

# Системные зависимости для Chromium/Puppeteer
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libasound2 \
  libxshmfence1 \
  libwayland-egl1 \
  libwayland-client0 \
  libwayland-server0 \
  libgtk-3-0 \
  wget \
  ca-certificates \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Рабочая директория бэкенда — путь ../frontend/build из __dirname будет /app/frontend/build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev
RUN node node_modules/puppeteer/install.js

COPY backend/ ./

# Копируем собранный фронтенд из stage 1
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

EXPOSE 3000
CMD ["node", "app.js"]
