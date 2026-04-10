#!/usr/bin/env bash
# Скрипт деплоя — запускать на сервере в директории проекта.
# Первый запуск: bash deploy.sh
# Последующие пуши: запускается автоматически через GitHub Actions.
set -euo pipefail

echo "→ Получаем последние изменения..."
git pull origin main

echo "→ Устанавливаем зависимости и собираем фронтенд..."
npm run setup

echo "→ Перезапускаем сервер..."
# reload — graceful restart без даунтайма
# если PM2 ещё не запущен — стартуем первый раз
pm2 reload picex --update-env 2>/dev/null \
  || pm2 start ecosystem.config.js --env production

pm2 save

echo "✓ Готово — сервер слушает на порту ${PORT:-3000}"
