# Инструкция по деплою на VPS (без Docker)

## Требования

- Домен: `cashback.doroninva.ru`
- Web-сервер: **Caddy** (на хосте)
- БД: **PostgreSQL** (на хосте)
- Путь приложения: `/srv/apps/cashback`
- Node.js: **требуется** (устанавливается на хост)

---

## Шаг 1: Установка Node.js 20

```bash
# Для Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версий
node --version  # Должно быть v20.x.x
npm --version   # Должно быть 10.x.x
```

---

## Шаг 2: Подготовка базы данных

Подключитесь к PostgreSQL и создайте БД и пользователя:

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE cashback_db;
CREATE USER cashback_user WITH PASSWORD 'cashback_pass';
GRANT ALL PRIVILEGES ON DATABASE cashback_db TO cashback_user;
\q
```

> ⚠️ **Важно:** Замените пароль `cashback_pass` на более надёжный!

---

## Шаг 3: Развёртывание приложения

```bash
# Перейти в директорию приложения
cd /srv/apps/cashback

# Установить зависимости
npm install

# Создать файл .env из шаблона
cp .env.example .env

# Отредактировать .env
nano .env
```

Заполните `.env`:

```env
# NextAuth JWT Secret (сгенерируйте: openssl rand -base64 32)
AUTH_SECRET=<ваш-секретный-ключ>

# Подключение к базе данных
DATABASE_URL=postgresql://cashback_user:cashback_pass@localhost:5432/cashback_db

# URL приложения
NEXTAUTH_URL=https://cashback.doroninva.ru

# Порт приложения
PORT=3010

# Переменные для создания первого пользователя (опционально)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-in-production
```

---

## Шаг 4: Применение миграций базы данных

```bash
# Применить миграции
npx prisma migrate deploy
```

> ℹ️ Если миграции ещё не созданы, используйте:
> ```bash
> npx prisma migrate dev --name init
> ```

---

## Шаг 5: Создание первого пользователя

После применения миграций база данных пуста. Создайте первого пользователя:

```bash
# Создать пользователя с паролем
node scripts/create-user.js <email> <password>
```

**Пример:**
```bash
node scripts/create-user.js admin@example.com MySecurePassword123
```

> ℹ️ Скрипт проверит, что пользователь ещё не существует, и хеширует пароль перед сохранением.

---

## Шаг 6: Сборка приложения

```bash
# Собрать production-версию
npm run build
```

После успешной сборки будет создана папка `.next`.

---

## Шаг 7: Запуск приложения через PM2

```bash
# Установить PM2 глобально
sudo npm install -g pm2

# Запустить приложение
pm2 start npm --name "cashback-app" -- start

# Сохранить конфигурацию для автозапуска
pm2 save

# Настроить автозапуск при загрузке системы
pm2 startup
```

Последняя команда выведет инструкцию — выполните её (обычно это `sudo env PATH=$PATH:/usr/bin pm2 startup ...`).

---

## Шаг 8: Настройка Caddy

Отредактируйте `/etc/caddy/Caddyfile`:

```caddy
cashback.doroninva.ru {
    reverse_proxy localhost:3010
}
```

Перезагрузите Caddy:

```bash
sudo systemctl reload caddy
```

---

## Шаг 9: Проверка

### Проверить статус приложения

```bash
pm2 status
pm2 logs cashback-app
```

### Открыть в браузере

Перейдите на `https://cashback.doroninva.ru`

Caddy автоматически получит HTTPS-сертификат от Let's Encrypt.

### Войти в приложение

Используйте email и пароль, созданные в Шаге 5.

---

## Управление приложением

```bash
# Посмотреть статус
pm2 status

# Посмотреть логи
pm2 logs cashback-app

# Перезапустить
pm2 restart cashback-app

# Остановить
pm2 stop cashback-app

# Запустить
pm2 start cashback-app

# Удалить из списка PM2
pm2 delete cashback-app
```

---

## Обновление приложения

```bash
cd /srv/apps/cashback

# Обновить код из git
git pull

# Установить новые зависимости (если изменился package.json)
npm install

# Применить миграции (если есть новые)
npx prisma migrate deploy

# Пересобрать
npm run build

# Перезапустить приложение
pm2 restart cashback-app
```

---

## Безопасность

### 1. Настройте firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 2. Используйте надёжные пароли

- Замените `cashback_pass` в БД на сложный пароль
- Сгенерируйте новый `AUTH_SECRET`: `openssl rand -base64 32`
- Используйте сложный пароль для первого пользователя

### 3. Настройте автоматические обновления

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Ограничьте доступ к PostgreSQL

Убедитесь, что PostgreSQL слушает только localhost:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
# listen_addresses = 'localhost'
sudo systemctl restart postgresql
```

---

## Troubleshooting

### Приложение не запускается

Проверьте логи PM2:

```bash
pm2 logs cashback-app --lines 100
```

Проверьте переменные окружения:

```bash
cat .env
```

### Ошибка подключения к базе данных

Проверьте подключение:

```bash
psql -U cashback_user -d cashback_db -h localhost
```

Убедитесь, что PostgreSQL запущен:

```bash
sudo systemctl status postgresql
```

### Caddy не получает сертификат

Проверьте DNS:

```bash
dig cashback.doroninva.ru
```

Убедитесь, что домен указывает на IP вашего сервера.

Проверьте логи Caddy:

```bash
sudo journalctl -u caddy --no-pager | tail -50
```

### Ошибка Prisma

Попробуйте перегенерировать клиент:

```bash
npx prisma generate
```

---

## Мониторинг

```bash
# Статус приложения
pm2 status

# Логи в реальном времени
pm2 logs cashback-app

# Использование ресурсов
pm2 monit

# Место на диске
df -h

# Статус PostgreSQL
sudo systemctl status postgresql

# Статус Caddy
sudo systemctl status caddy
```

---

## Резервное копирование

### Бэкап базы данных

```bash
# Создать бэкап
pg_dump -U cashback_user cashback_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Сжать
gzip backup_*.sql
```

### Бэкап данных приложения

```bash
tar -czf cashback-backup-$(date +%Y%m%d).tar.gz \
  /srv/apps/cashback/.env \
  /srv/apps/cashback/prisma/schema.prisma
```

### Восстановление из бэкапа

```bash
# Распаковать SQL
gunzip backup_20260101.sql.gz

# Восстановить БД
psql -U cashback_user -d cashback_db < backup_20260101.sql
```

### Автоматический бэкап (cron)

```bash
# Редактировать crontab
crontab -e

# Добавить ежедневный бэкап в 3:00
0 3 * * * pg_dump -U cashback_user cashback_db | gzip > /backups/cashback_$(date +\%Y\%m\%d).sql.gz
```

---

## Полезные команды

```bash
# Пересоздать пользователя
node scripts/create-user.js newuser@example.com NewPassword123

# Проверка подключения к БД
node scripts/db-check.js

# Очистить кэш npm
npm cache clean --force

# Пересобрать без кэша
rm -rf .next && npm run build
```
