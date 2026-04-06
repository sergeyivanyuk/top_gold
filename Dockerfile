# Используем официальный образ Node.js LTS
FROM node:22-alpine AS base

# Устанавливаем pnpm (опционально, если используется) или оставляем npm
# В проекте используется npm (судя по package-lock.json)
# Устанавливаем зависимости только если нужно, но для скорости можно использовать pnpm
# Выбираем npm

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Запускаем приложение
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]