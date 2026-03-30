# Cashback Tracker — Project Context

## Project Overview

**Cashback Tracker** — это full-stack веб-приложение для отслеживания ежемесячных категорий кэшбэка по банковским картам. Приложение позволяет пользователям управлять категориями кэшбэка для нескольких банков и карт, организованными по месяцам.

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | NextAuth 5.0 (JWT sessions, Credentials provider) |
| **UI Components** | Lucide React icons, clsx, tailwind-merge |
| **Password Hashing** | bcryptjs |

### Architecture

- **Frontend**: React Server Components + Client Components (App Router)
- **Backend**: Next.js Server Actions для всех мутаций данных
- **Database**: PostgreSQL с каскадным удалением
- **Auth**: JWT-based сессии через NextAuth

---

## Building and Running

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured in `.env`

### Environment Setup

Создайте файл `.env` с следующими переменными:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cashback_db"
AUTH_SECRET="your-secret-key-here"
```

### Commands

```bash
# Install dependencies
npm install

# Generate Prisma client (runs automatically on postinstall)
npm run postinstall

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## Project Structure

```
cashback/
├── app/                      # Next.js App Router pages
│   ├── (auth)/               # Auth pages (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/          # Protected dashboard pages
│   │   ├── layout.tsx        # Dashboard layout with auth check
│   │   └── page.tsx          # Main dashboard page
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── actions/                  # Server Actions
│   ├── auth.ts               # Registration and login
│   ├── banks.ts              # Bank CRUD operations
│   ├── cards.ts              # Card CRUD operations
│   ├── categories.ts         # Category CRUD operations
│   ├── export-import.ts      # Data export/import
│   ├── months.ts             # Month management
│   └── seed.ts               # Demo data seeding
├── components/               # React components
│   ├── BankList.tsx          # Banks display component
│   ├── CardItem.tsx          # Single card component
│   ├── CategorySearchBlock.tsx
│   ├── DashboardClient.tsx   # Main dashboard client component
│   ├── ExportImport.tsx      # Export/import UI
│   ├── icons.ts              # Custom icons
│   ├── MonthSelector.tsx     # Month navigation
│   └── SummaryBlock.tsx      # Summary statistics
├── lib/                      # Utilities
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   └── schema.prisma         # Database schema
├── auth.ts                   # NextAuth configuration
├── middleware.ts             # Auth middleware for route protection
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Database Schema

### Core Models

```prisma
User
├── id: String (cuid)
├── email: String (unique)
├── passwordHash: String
└── createdAt: DateTime

Month
├── id: String (cuid)
├── userId: String (FK → User)
├── key: String (e.g., "2026-03")
├── label: String (e.g., "March 2026")
└── createdAt: DateTime

Bank
├── id: String (cuid)
├── monthId: String (FK → Month)
├── name: String
├── position: Int
└── createdAt: DateTime

Card
├── id: String (cuid)
├── bankId: String (FK → Bank)
├── name: String
├── type: String?
├── note: String?
├── position: Int
└── createdAt: DateTime

UserCategory
├── id: String (cuid)
├── userId: String (FK → User)
├── name: String
├── color: String?
└── createdAt: DateTime

CashbackCategory
├── id: String (cuid)
├── cardId: String (FK → Card)
├── userCategoryId: String (FK → UserCategory)
├── percent: Float
├── limit: Float?
├── comment: String?
├── isPromoted: Boolean
├── position: Int
└── createdAt: DateTime
```

### Relationships

- `User` → many `Month`
- `User` → many `UserCategory`
- `Month` → many `Bank`
- `Bank` → many `Card`
- `Card` → many `CashbackCategory`
- `UserCategory` → many `CashbackCategory`

### Cascade Delete

- Удаление `Month` удаляет все `Bank` → `Card` → `CashbackCategory`
- Удаление `Bank` удаляет все `Card` → `CashbackCategory`
- Удаление `Card` удаляет все `CashbackCategory`

---

## Authentication Flow

### Registration (`/register`)

1. Пользователь вводит email и пароль
2. Server Action `register()`:
   - Проверяет существование пользователя
   - Хеширует пароль через bcrypt
   - Создаёт запись в БД

### Login (`/login`)

1. Пользователь вводит credentials
2. Server Action `login()` вызывает `signIn()` из NextAuth
3. NextAuth использует Credentials Provider:
   - Находит пользователя по email
   - Сравнивает хеш пароля
   - Возвращает user object
4. JWT токен создаётся с `sub = user.id`
5. Сессия расширяется через callback

### Session Callback

```typescript
async session({ session, token }) {
  if (token.sub) {
    session.user.id = token.sub;
  }
  return session;
}
```

---

## Middleware Protection

`middleware.ts` защищает все маршруты кроме:

- `/api/*`
- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`

**Логика:**

- Auth страницы (`/login`, `/register`) перенаправляют на `/` если пользователь авторизован
- Все остальные маршруты перенаправляют на `/login` если пользователь не авторизован

---

## Server Actions API

### Auth Actions

| Action | Description |
|--------|-------------|
| `register(formData)` | Создаёт нового пользователя |
| `login(formData)` | Авторизует пользователя через NextAuth |

### Month Actions

| Action | Description |
|--------|-------------|
| `getMonths()` | Возвращает все месяцы текущего пользователя |
| `getMonthData(monthId)` | Возвращает полные данные месяца с банками, картами, категориями |
| `createMonthUnified(key, label, baseMonthId?, categorySourceMonthId?)` | Создаёт месяц с опциональным копированием структуры |
| `deleteMonth(monthId)` | Удаляет месяц и все связанные данные |

### Bank Actions

| Action | Description |
|--------|-------------|
| `createBank(monthId, name, position)` | Создаёт банк в месяце |
| `updateBank(bankId, name, position)` | Обновляет банк |
| `deleteBank(bankId)` | Удаляет банк и все карты |

### Card Actions

| Action | Description |
|--------|-------------|
| `createCard(bankId, name, type?, note?, position)` | Создаёт карту в банке |
| `updateCard(cardId, name, type, note, position)` | Обновляет карту |
| `deleteCard(cardId)` | Удаляет карту и все категории |

### Category Actions

| Action | Description |
|--------|-------------|
| `getUserCategories()` | Возвращает все категории пользователя |
| `createUserCategory(name, color?)` | Создаёт глобальную категорию пользователя |
| `createCashbackCategory(cardId, userCategoryId, percent, limit?, comment?, isPromoted, position)` | Добавляет категорию к карте |
| `updateCashbackCategory(id, percent, limit, comment, isPromoted, position)` | Обновляет категорию |
| `deleteCashbackCategory(id)` | Удаляет категорию |

### Export/Import Actions

| Action | Description |
|--------|-------------|
| `exportData()` | Экспортирует все данные пользователя в JSON |
| `importData(data)` | Импортирует данные из JSON (валидация + insert) |

---

## UI Components

### DashboardClient

Главный клиентский компонент дашборда:

- Отображает выбранный месяц
- Показывает список банков с картами
- Предоставляет поиск по категориям
- Обрабатывает empty state (нет месяцев)

### MonthSelector

Компонент навигации по месяцам:

- Выпадающий список всех месяцев
- Кнопка создания нового месяца
- Кнопка копирования предыдущего месяца

### BankList

Отображает список банков:

- Группировка карт по банкам
- Drag-and-drop сортировка (если реализована)
- Кнопки добавления/редактирования/удаления

### CardItem

Отображает отдельную карту:

- Название карты и тип
- Список категорий кэшбэка
- Процент кэшбэка визуально выделен
- Кнопки управления категориями

### CategorySearchBlock

Поиск и фильтрация категорий:

- Поиск по названию категории
- Фильтрация карт по выбранной категории

### SummaryBlock

Сводная статистика:

- Общее количество карт
- Средние проценты по категориям
- Продвинутые категории (isPromoted)

### ExportImport

Управление данными:

- Кнопка экспорта в JSON
- Кнопка импорта из JSON
- Обработка ошибок

---

## Key Business Rules

### Data Ownership

- **Все запросы к БД должны быть scoped по `userId`**
- Никогда не доверять `userId` от клиента
- Извлекать identity пользователя из сессии на сервере

### Month Creation

При создании нового месяца:

1. Можно создать пустой месяц
2. Можно скопировать структуру из предыдущего месяца (банки + карты)
3. Можно скопировать категории кэшбэка из другого месяца

### Category System

- `UserCategory` — глобальные категории пользователя (например, "Супермаркеты", "АЗС")
- `CashbackCategory` — привязка категории к конкретной карте с процентом и лимитом
- Одна категория пользователя может использоваться на нескольких картах

### Validation

- Все формы валидируются на клиенте и сервере
- `percent` должен быть числом в разумных пределах
- Названия не могут быть пустыми
- Ключ месяца нормализуется (YYYY-MM)

---

## Security Considerations

### Password Handling

- Пароли хешируются через bcrypt с cost=10
- Никогда не логировать пароли

### Session Security

- JWT strategy с httpOnly cookies
- `AUTH_SECRET` должен быть установлен в production

### Query Scoping

Каждый Server Action проверяет авторизацию:

```typescript
const session = await auth();
if (!session?.user?.id) throw new Error("Unauthorized");

// Все запросы включают userId
where: { id: monthId, userId: session.user.id }
```

---

## Development Conventions

### TypeScript

- Strict mode включён
- Избегать `any`除非 есть документированная причина
- Предпочитать явные типы

### Component Structure

- Server Components по умолчанию
- Client Components только когда нужен state/interactivity
- Разделять server и client concerns

### Naming

- Компоненты: PascalCase (`BankList`, `CardItem`)
- Server Actions: camelCase (`createBank`, `updateCard`)
- Файлы: match component/action name

### Code Style

- Предпочитать маленькие композируемые функции
- Избегать преждевременных абстракций
- Комментарии только там, где они добавляют ценность

---

## Testing (Not Implemented)

Проект требует добавления тестов:

```bash
# Unit tests (recommended: Vitest)
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (recommended: Playwright)
npm run test:e2e
```

### Required Test Coverage

- Auth flow (register, login, logout)
- Month CRUD
- Copy month functionality
- Bank/Card/Category CRUD
- Export/Import
- Search/filter functionality

---

## Common Tasks

### Add a New Month

1. Открыть дашборд
2. Нажать "Создать месяц" в MonthSelector
3. Выбрать базовый месяц для копирования (опционально)
4. Выбрать источник категорий (опционально)

### Add a Bank

1. В DashboardClient нажать "Добавить банк"
2. Ввести название
3. Сохранить

### Add a Card to Bank

1. В BankList найти банк
2. Нажать "Добавить карту"
3. Заполнить название, тип, заметку

### Add Cashback Category to Card

1. В CardItem найти карту
2. Нажать "Добавить категорию"
3. Выбрать из существующих UserCategory или создать новую
4. Указать процент, лимит, комментарий

### Export Data

1. Нажать кнопку экспорта в ExportImport компоненте
2. JSON файл скачается автоматически

### Import Data

1. Нажать кнопку импорта в ExportImport компоненте
2. Выбрать JSON файл
3. Данные валидируются и импортируются

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Secret for JWT signing (generate with `openssl rand -base64 32`) |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Self-hosted (VPS)

```bash
# Build
npm run build

# Set environment variables
export DATABASE_URL="..."
export AUTH_SECRET="..."

# Start
npm run start
```

---

## Known Limitations

- Нет drag-and-drop сортировки (только позиционирование через формы)
- Нет PWA поддержки
- Нет аналитики/визуализации данных
- Нет reminders для заполнения месяца

---

## Future Enhancements

- Best category summary per month
- Pinned banks
- Favorite categories
- Reminders to fill new month
- Analytics on recurring categories
- PWA support
- Dark/light theme toggle

---

## Agent Guidelines

При работе с этим проектом:

1. **Всегда проверяй схему БД** перед добавлением новых полей
2. **Сохраняй type safety** — избегай `any`
3. **Уважай domain boundaries** — auth в auth.ts, DB в prisma
4. **Все мутации через Server Actions** с проверкой авторизации
5. **Добавляй валидацию** на клиенте и сервере
6. **Обрабатывай empty/loading/error states** в UI
7. **Используй каскадное удаление** осознанно
8. **Сохраняй UI консистентным** с существующими паттернами

### Before Committing

- [ ] Проверить что auth проверен во всех Server Actions
- [ ] Убедиться что все запросы scoped по userId
- [ ] Проверить типы TypeScript
- [ ] Обработать error states в UI
- [ ] Обновить миграции если изменена схема
