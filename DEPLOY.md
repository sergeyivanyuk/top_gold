# Развертывание Top-Gold на VPS с Docker

Это руководство описывает процесс выгрузки приложения Top-Gold на VPS сервер с использованием Docker и Docker Compose.

## Предварительные требования

- VPS сервер с ОС Ubuntu 22.04 / 24.04 (или другой Linux дистрибутив)
- Установленный Docker и Docker Compose
- Доменное имя (например, topgold.store), направленное на IP сервера

## 1. Установка Docker и Docker Compose

Если Docker не установлен, выполните на сервере:

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 2. Подготовка проекта на сервере

Склонируйте репозиторий или загрузите файлы проекта на сервер:

```bash
git clone <https://github.com/sergeyivanyuk/topGold> /opt/top-gold
cd /opt/top-gold
```

Либо скопируйте файлы через SCP.

## 3. Настройка переменных окружения

Создайте файл `.env.production` на основе примера:

```bash
cp .env.production.example .env.production
nano .env.production
```

Заполните реальные значения:

```
PLATEGA_MERCHANT_ID=ваш_merchant_id
PLATEGA_API_KEY=ваш_api_key
NEXT_PUBLIC_BASE_URL=https://topgold.store
NEXT_PUBLIC_USE_MOCK_PAYMENT=false
PORT=3000
```

## 4. Сборка и запуск контейнеров

Используйте Docker Compose для сборки и запуска:

```bash
docker-compose up -d --build
```

Эта команда:

- Соберёт образ приложения из Dockerfile
- Запустит контейнер `top-gold-app` на порту 3000
- Настроит автоматический перезапуск при падении

## 5. Проверка сборки

Перед запуском в production рекомендуется убедиться, что сборка проходит без ошибок. Если при сборке возникает ошибка
`Cannot find module '@tailwindcss/postcss'`, это означает, что dev-зависимости не установлены. В Dockerfile по умолчанию используется
`npm ci --only=production`, который не устанавливает dev-зависимости, но они необходимы для сборки Next.js с Tailwind CSS.

**Исправление:** Убедитесь, что в Dockerfile строка установки зависимостей выглядит как `RUN npm ci` (без `--only=production`). Актуальная версия
Dockerfile в репозитории уже содержит это исправление.

Для ручной проверки можно выполнить:

```bash
docker-compose build --no-cache app
```

Если сборка завершилась успешно, вы увидите сообщение `✓ Compiled successfully` и список сгенерированных маршрутов.

## 6. Проверка работы

Убедитесь, что контейнер запущен:

```bash
docker ps
```

Проверьте логи:

```bash
docker logs top-gold-app
```

Откройте в браузере `http://your-server-ip:3000` или `https://topgold.store` (если настроен прокси).

## 7. Настройка обратного прокси (Nginx + SSL)

Рекомендуется использовать Nginx как обратный прокси и настроить SSL через Let's Encrypt.

### Установите Nginx и Certbot:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

### Создайте конфигурацию Nginx:

Файл `/etc/nginx/sites-available/topgold.store`:

```nginx
server {
    listen 80;
    server_name topgold.store www.topgold.store;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте сайт:

```bash
sudo ln -s /etc/nginx/sites-available/topgold.store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Получите SSL сертификат:

```bash
sudo certbot --nginx -d topgold.store -d www.topgold.store
```

Certbot автоматически обновит конфигурацию Nginx для использования HTTPS.

## 8. Обновление приложения

Для обновления кода:

```bash
cd /opt/top-gold
git pull origin main  # или скопируйте новые файлы
docker-compose down
docker-compose up -d --build
```

## 9. Мониторинг и логи

- Логи приложения: `docker logs -f top-gold-app`
- Логи Nginx: `sudo tail -f /var/log/nginx/access.log`
- Мониторинг ресурсов: `docker stats`

## 10. Резервное копирование

Рекомендуется регулярно создавать резервные копии базы данных (если есть) и файлы конфигурации.

## Устранение неполадок

### Контейнер не запускается

Проверьте логи: `docker logs top-gold-app`

### Ошибка порта 3000 уже занят

Измените порт в `docker-compose.yml` и в настройках Nginx.

### Изображения не загружаются

Убедитесь, что `next.config.ts` содержит `unoptimized: true` для статических файлов.

### Платежи не работают

Проверьте переменные окружения PLATEGA_MERCHANT_ID и PLATEGA_API_KEY.

## Дополнительные настройки

- Настройка firewall (UFW): разрешите порты 80, 443, 22.
- Автоматическое обновление контейнеров с помощью Watchtower.
- Использование Docker volumes для постоянного хранения (если нужно).

## Контакты

При возникновении проблем обратитесь к разработчику.

```

```
