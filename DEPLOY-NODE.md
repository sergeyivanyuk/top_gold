# Развертывание Top-Gold на VPS с Node.js (без Docker)

Это руководство описывает процесс выгрузки приложения Top-Gold на VPS сервер с использованием Node.js и PM2 для управления процессами.

## Предварительные требования

- VPS сервер с ОС Ubuntu 22.04 / 24.04 (или другой Linux дистрибутив)
- Установленный Node.js версии 18 или выше
- Установленный npm (обычно поставляется с Node.js)
- Доменное имя (например, topgold.store), направленное на IP сервера (опционально для production)

## 1. Установка Node.js и npm

Если Node.js не установлен, выполните на сервере:

```bash
# Для Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка установки
node --version
npm --version
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

## 4. Установка зависимостей

Установите все зависимости (включая dev-зависимости, необходимые для сборки):

```bash
npm ci
```

## 5. Сборка приложения

Соберите production-версию Next.js:

```bash
npm run build
```

Если возникает ошибка `Cannot find module '@tailwindcss/postcss'`, убедитесь, что dev-зависимости установлены (команда `npm ci` установит их). Если
используется `npm ci --only=production`, замените на `npm ci`.

## 6. Запуск приложения

### Вариант A: Прямой запуск (для тестирования)

```bash
npm start
```

Приложение будет доступно на порту 3000 (или указанном в переменной PORT).

### Вариант B: Запуск через PM2 (рекомендуется для production)

Установите PM2 глобально:

```bash
npm install -g pm2
```

Запустите приложение под управлением PM2:

```bash
pm2 start npm --name "top-gold" -- start
```

Сохраните список процессов PM2 и настройте автозагрузку:

```bash
pm2 save
pm2 startup
```

Команда `pm2 startup` выведет инструкцию, которую нужно выполнить для настройки автозапуска при загрузке системы.

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
npm ci
npm run build
pm2 restart top-gold
```

## 9. Мониторинг и логи

- Логи приложения через PM2: `pm2 logs top-gold`
- Логи Nginx: `sudo tail -f /var/log/nginx/access.log`
- Мониторинг процессов PM2: `pm2 status`

## 10. Резервное копирование

Рекомендуется регулярно создавать резервные копии базы данных (если есть) и файлы конфигурации.

## Устранение неполадок

### Приложение не запускается

Проверьте логи: `pm2 logs top-gold`

### Ошибка порта 3000 уже занят

Измените порт в переменной окружения PORT и в настройках Nginx.

### Изображения не загружаются

Убедитесь, что `next.config.ts` содержит `unoptimized: true` для статических файлов.

### Платежи не работают

Проверьте переменные окружения PLATEGA_MERCHANT_ID и PLATEGA_API_KEY.

## Дополнительные настройки

- Настройка firewall (UFW): разрешите порты 80, 443, 22.
- Использование системы инициализации для автоматического перезапуска PM2.

## Контакты

При возникновении проблем обратитесь к разработчику.
