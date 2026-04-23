# Cashback Tracker

Веб-приложение для ведения месячных категорий кэшбэка по банкам и картам. Проект помогает хранить структуру "месяц -> банк -> карта -> категории кэшбэка", быстро искать лучший процент по категории и переносить данные между месяцами.

## Возможности

- регистрация и вход по email/паролю через NextAuth Credentials;
- изоляция данных по пользователям;
- создание и удаление месяцев;
- копирование структуры банков и карт из предыдущего месяца;
- опциональное копирование категорий кэшбэка из выбранного месяца;
- добавление банков, карт и категорий кэшбэка;
- справочник пользовательских категорий с автодополнением;
- поиск по банкам, картам и категориям;
- блок с топом кэшбэков месяца;
- поиск всех карт с выбранной категорией кэшбэка;
- импорт и экспорт пользовательских данных в JSON;
- демо-заполнение для пустого аккаунта.

## Стек

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- NextAuth 5 beta
- Prisma 5
- PostgreSQL
- bcryptjs
- lucide-react
- Docker / Docker Compose

## Структура проекта

```text
.
|-- actions/              # Server Actions для auth, месяцев, банков, карт, категорий, import/export
|-- app/                  # Next.js App Router: dashboard, login, register, auth API route
|-- components/           # Клиентские компоненты интерфейса
|-- lib/prisma.ts         # Prisma Client singleton
|-- prisma/schema.prisma  # Схема базы данных
|-- scripts/              # Утилиты для проверки БД и создания пользователя
|-- Dockerfile
|-- docker-compose.yml
|-- DEPLOY.md             # Подробная инструкция деплоя на VPS
`-- Caddyfile.example
```

## Модель данных

Основные сущности:

- `User` - пользователь с email и хешем пароля;
- `Month` - месяц пользователя, например `2026-03`;
- `Bank` - банк внутри месяца;
- `Card` - карта внутри банка;
- `UserCategory` - пользовательский справочник категорий;
- `CashbackCategory` - категория кэшбэка на конкретной карте с процентом, лимитом, комментарием и флагом промо.

Связанные данные удаляются каскадно: при удалении пользователя удаляются его месяцы и категории, при удалении месяца удаляются банки, карты и категории кэшбэка.

## Требования

- Node.js 20+
- npm
- PostgreSQL

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` на основе примера:

```bash
cp .env.example .env
```

В PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Заполните переменные окружения:

```env
AUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/cashback_db
NEXTAUTH_URL=http://localhost:3010
PORT=3010
```

Секрет можно сгенерировать командой:

```bash
openssl rand -base64 32
```

Если `openssl` недоступен, можно использовать Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Подготовьте базу данных.

В проекте сейчас есть `prisma/schema.prisma`, но нет папки `prisma/migrations`, поэтому для локального старта удобнее использовать:

```bash
npx prisma db push
```

Если вы добавите миграции, для production можно использовать:

```bash
npm run db:migrate
```

5. Запустите dev-сервер:

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3010`.

## Создание пользователя

Пользователя можно создать через страницу регистрации `/register` или через скрипт:

```bash
node scripts/create-user.js admin@example.com MySecurePassword123
```

Скрипт проверяет формат email, минимальную длину пароля и не создает дубликат пользователя.

## Основные команды

```bash
npm run dev        # запуск разработки на порту 3010
npm run build      # production-сборка
npm run start      # запуск production-сборки на порту 3010
npm run lint       # проверка линтером Next.js
npm run db:push    # синхронизация схемы Prisma с БД
npm run db:migrate # применение Prisma migrations
```

Дополнительные скрипты:

```bash
node scripts/db-check.js              # проверка подключения к БД и таблицы пользователей
node scripts/create-user.js <email> <password>
```

## Docker

В проекте есть `Dockerfile` для standalone-сборки Next.js и `docker-compose.yml`.

Compose-конфигурация ожидает:

- внешнюю Docker-сеть `caddy`;
- PostgreSQL на хосте, доступный из контейнера как `host.docker.internal`;
- переменную `AUTH_SECRET` в окружении;
- домен `cashback.doroninva.ru`.

Пример запуска:

```bash
docker compose up -d --build
```

Перед production-запуском проверьте значения в `docker-compose.yml`, особенно:

- `DATABASE_URL`;
- `NEXTAUTH_URL`;
- Caddy labels;
- порт приложения.

## Импорт и экспорт данных

В шапке dashboard есть раздел настроек данных:

- экспорт скачивает JSON-файл с месяцами, банками, картами и категориями текущего пользователя;
- импорт принимает JSON и полностью заменяет текущие данные пользователя данными из резервной копии.

Перед импортом приложение запрашивает подтверждение, потому что текущие месяцы пользователя будут удалены.

## Аутентификация и доступ

Аутентификация настроена в `auth.ts` через NextAuth Credentials Provider. Пароли хешируются с помощью `bcryptjs`.

`middleware.ts` защищает все страницы, кроме:

- `/login`;
- `/register`;
- `/api/*`;
- статических ресурсов Next.js.

Авторизованный пользователь при попытке открыть `/login` или `/register` перенаправляется на главную страницу.

## Деплой

Подробная инструкция для VPS находится в `DEPLOY.md`. В репозитории также есть пример Caddy-конфига:

```caddy
cashback.doroninva.ru {
    reverse_proxy cashback-app:3010
}
```

Для деплоя без Docker типовой порядок такой:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm run start
```

Для постоянного запуска можно использовать PM2 или systemd.

## Важные заметки

- В репозитории нет Prisma migrations, только `schema.prisma`. Для первого локального запуска используйте `npm run db:push` или создайте миграцию командой `npx prisma migrate dev --name init`.
- Некоторые server actions обновляют и удаляют сущности по `id`; при расширении проекта стоит дополнительно проверять принадлежность банка, карты и категории текущему пользователю во всех mutate-операциях.
- `build.log` показывает, что сборка проходила успешно, но Next.js предупреждал о `bcryptjs` в Edge Runtime через `auth.ts`.
- `.env` не должен попадать в репозиторий; используйте `.env.example` как шаблон.
