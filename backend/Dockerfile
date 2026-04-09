FROM node:18

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

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

RUN node node_modules/puppeteer/install.js

COPY backend/ .

EXPOSE 5000
CMD ["node", "app.js"]

