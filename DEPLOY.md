# Инструкция по деплою на VPS

## Требования

- Домен: `cashback.doroninva.ru`
- Web-сервер: **Caddy** (на хосте)
- БД: **PostgreSQL** (на хосте)
- Путь приложения: `/srv/apps/cashback`
- Node.js: **не требуется** (приложение в Docker)

---

## Шаг 1: Подготовка базы данных

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

> ⚠️ Замените пароль на более надёжный!

---

## Шаг 2: Создание сети для Caddy

Если сеть `caddy` ещё не создана:

```bash
docker network inspect caddy >/dev/null 2>&1 || docker network create caddy
```

---

## Шаг 3: Развёртывание приложения

```bash
# Перейти в директорию приложения
cd /srv/apps/cashback

# Сгенерировать секретный ключ для NextAuth
openssl rand -base64 32
```

Скопируйте вывод команды выше — это ваш `AUTH_SECRET`.

```bash
# Создать файл .env из шаблона
cp .env.example .env

# Отредактировать .env
nano .env
```

Заполните `.env`:

```env
AUTH_SECRET=<ваш-ключ-из-openssl>
DATABASE_URL=postgresql://cashback_user:cashback_pass@host.docker.internal:5432/cashback_db
NEXTAUTH_URL=https://cashback.doroninva.ru
NODE_ENV=production
```

---

## Шаг 4: Сборка и запуск

```bash
# Собрать образ
docker compose build

# Запустить контейнер
docker compose up -d

# Применить миграции базы данных
docker compose exec cashback-app npx prisma migrate deploy
```

---

## Шаг 4.1: Создание первого пользователя

После первого запуска база данных пуста. Создайте первого пользователя:

```bash
# Создать пользователя с паролем
docker compose exec cashback-app node scripts/create-user.js <email> <password>
```

**Пример:**
```bash
docker compose exec cashback-app node scripts/create-user.js admin@example.com MySecurePassword123
```

> ℹ️ Скрипт проверит, что пользователь ещё не существует, и хеширует пароль перед сохранением.

**Альтернатива через переменные окружения:**
```bash
# Если хотите использовать значения из .env
docker compose exec cashback-app sh -c "node scripts/create-user.js \$ADMIN_EMAIL \$ADMIN_PASSWORD"
```

---

## Шаг 5: Настройка Caddy

### Вариант A: Caddy установлен на хосте

Отредактируйте `/etc/caddy/Caddyfile`:

```caddy
cashback.doroninva.ru {
    reverse_proxy cashback-app:3000
}
```

Перезагрузите Caddy:

```bash
sudo systemctl reload caddy
```

### Вариант B: Caddy в Docker

Скопируйте `Caddyfile.example` в конфигурационную директорию Caddy:

```bash
cp Caddyfile.example /path/to/caddy/Caddyfile
```

Перезагрузите Caddy:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## Шаг 6: Проверка

### Проверить статус контейнера

```bash
docker compose ps
```

### Посмотреть логи приложения

```bash
docker compose logs -f cashback-app
```

### Проверить доступность

```bash
curl -I http://localhost:3000
```

### Открыть в браузере

Перейдите на `https://cashback.doroninva.ru`

Caddy автоматически получит HTTPS-сертификат от Let's Encrypt.

---

## Управление приложением

```bash
# Остановить
docker compose down

# Перезапустить
docker compose restart

# Пересобрать и перезапустить
docker compose build && docker compose up -d

# Посмотреть логи
docker compose logs -f

# Выполнить команду в контейнере
docker compose exec cashback-app sh

# Применить миграции
docker compose exec cashback-app npx prisma migrate deploy
```

---

## Обновление приложения

```bash
cd /srv/apps/cashback

# Обновить код из git
git pull

# Пересобрать и перезапустить
docker compose build
docker compose up -d

# Применить миграции (если есть)
docker compose exec cashback-app npx prisma migrate deploy
```

---

## Безопасность

1. **Замените пароли по умолчанию** в `.env`:
   - `cashback_pass` → надёжный пароль
   - `AUTH_SECRET` → сгенерированный ключ

2. **Настройте firewall**:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Настройте автоматические обновления**:
   ```bash
   sudo apt install unattended-upgrades
   ```

---

## Troubleshooting

### Ошибка подключения к БД

Проверьте, что PostgreSQL слушает нужные интерфейсы:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
# listen_addresses = '*'
sudo systemctl restart postgresql
```

Проверьте `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
# host all all 172.17.0.0/16 md5
sudo systemctl restart postgresql
```

### Caddy не получает сертификат

Проверьте DNS:
```bash
dig cashback.doroninva.ru
```

Убедитесь, что домен указывает на IP вашего сервера.

### Приложение не запускается

Проверьте логи:
```bash
docker compose logs cashback-app
```

Проверьте переменные окружения:
```bash
docker compose exec cashback-app env
```

---

## Мониторинг

```bash
# Статус контейнеров
docker compose ps

# Использование ресурсов
docker stats cashback-app

# Логи в реальном времени
docker compose logs -f cashback-app

# Место на диске
df -h
docker system df
```

---

## Резервное копирование

### Бэкап базы данных

```bash
docker exec $(docker ps -q -f name=postgres) pg_dump -U cashback_user cashback_db > backup_$(date +%Y%m%d).sql
```

### Бэкап данных приложения

```bash
tar -czf cashback-backup-$(date +%Y%m%d).tar.gz /srv/apps/cashback
```

### Восстановление из бэкапа

```bash
psql -U cashback_user -d cashback_db < backup_20260101.sql
```
