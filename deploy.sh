#!/usr/bin/env bash
# Скрипт деплоя — запускать на сервере в директории проекта.
# Первый запуск: bash deploy.sh
# Последующие деплои: автоматически через GitHub Actions при пуше в main.
set -euo pipefail

echo "→ Получаем последние изменения..."
git pull origin main

echo "→ Устанавливаем зависимости..."
npm install

echo "→ Собираем проект..."
npm run build

echo "→ Перезапускаем сервер..."
pm2 reload picex --update-env 2>/dev/null \
  || pm2 start ecosystem.config.js --env production

pm2 save

echo "✓ Готово — сервер слушает на порту ${PORT:-3000}"
