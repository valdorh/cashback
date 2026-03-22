# AGENT.md

## Project
Cashback Tracker — full-stack web application for tracking monthly cashback categories across multiple banks and cards.

## Mission
Build and maintain a practical, production-minded personal cashback tracker that:
- works across multiple devices;
- stores business data on the backend;
- is fast and readable on mobile;
- is easy to extend without rewriting the project every two weeks.

---

## Product Principles
1. **Backend is mandatory.**
   Main business data must never live only in browser storage.

2. **One user sees only their own data.**
   Every data access path must be scoped to the authenticated user.

3. **Current month first.**
   The app should open to the current month by default after login.

4. **Fast editing beats decorative complexity.**
   This is a utility product, not a banking-themed art installation.

5. **Mobile-first UI.**
   The app must be comfortable to use on a phone, then scale up to desktop.

6. **Simple architecture over clever architecture.**
   Avoid unnecessary abstractions, microservices, and generic factories nobody wants to debug.

---

## Recommended Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers / Server Actions
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth/Auth.js or secure custom JWT/session auth
- **Validation:** Zod
- **Forms:** React Hook Form
- **Testing:** Vitest + Testing Library + Playwright
- **Deployment:** Vercel / Railway / Render / self-hosted VPS

If another stack is proposed, it must preserve:
- typed frontend and backend;
- real backend API;
- real database;
- secure auth;
- maintainable structure.

---

## Non-Negotiable Rules
### Data storage
- Do not use `localStorage` as the primary business data store.
- `localStorage` may only be used for:
  - theme;
  - UI preferences;
  - temporary draft state;
  - short-lived cache.

### Authentication
- Passwords must be hashed.
- Protected routes must reject unauthenticated access.
- All API queries and mutations must be user-scoped.

### Authorization
- Never trust client-provided `userId`.
- Derive user identity from session/token on the server.
- Every DB query must ensure ownership.

### Database
- Use relational modeling, not random JSON blobs for core entities.
- Migrations must be explicit and versioned.
- Seed data must be optional and safe.

### UX
- Important cashback information must be visible without opening five nested dialogs.
- Avoid heavy spreadsheet UI unless absolutely necessary.
- CRUD flows should be fast, obvious, and reversible.

### Code quality
- TypeScript strict mode should be enabled.
- Avoid `any` unless there is a real, documented reason.
- Prefer small composable functions over giant components.
- Keep server and client concerns separated.

---

## Core Domain Model
### User
Stores account identity and authentication-related data.

### Month
Represents one month of cashback data for a user.
Example key: `2026-03`

### Bank
Bank entity inside a month.

### Card
Bank card inside a bank.

### CashbackCategory
Cashback category for a specific card in a specific month context.

---

## Suggested Data Relationships
- One `User` has many `Month`
- One `Month` has many `Bank`
- One `Bank` has many `Card`
- One `Card` has many `CashbackCategory`

Deletion behavior:
- Deleting a month deletes its banks, cards, and categories.
- Deleting a bank deletes its cards and categories.
- Deleting a card deletes its categories.

Use cascade deletes carefully and intentionally.

---

## MVP Scope
The minimum working product must support:

1. User registration
2. User login/logout
3. Auto-open current month
4. Create month
5. Copy previous month into a new month
6. Add/edit/delete bank
7. Add/edit/delete card
8. Add/edit/delete cashback category
9. Search/filter by bank, card, category
10. Import/export JSON backup
11. Persist everything in PostgreSQL

---

## Required Screens
1. **Auth page**
   - sign in
   - sign up

2. **Dashboard**
   - current month selector
   - banks
   - cards
   - cashback categories
   - search/filter

3. **Month management**
   - create month
   - copy previous month

4. **Import / Export screen**
   - export JSON
   - import JSON

5. **Settings/Profile** (optional in MVP, preferred after MVP)

---

## API Rules
### General
- Use clear, predictable route naming.
- Return typed response shapes.
- Validate all inputs on the server.
- Return useful error messages.
- Avoid mixing unrelated responsibilities into one endpoint.

### Required capabilities
- register user
- sign in user
- sign out user
- get current user
- list months
- create month
- copy month
- list banks by month
- create/update/delete bank
- create/update/delete card
- create/update/delete cashback category
- export user data
- import user data

### API safety
- Never expose data from another user.
- Never accept raw client ownership fields without verification.
- Use transactions when copying month data.

---

## UI Rules
### Visual style
- Clean
- Compact
- Readable
- Mobile-first
- Minimal but not sterile

### Dashboard behavior
- The selected month must be clearly visible.
- Cashback percentages must stand out visually.
- Cards must be grouped by bank.
- A user should be able to answer:
  - what are my categories this month?
  - which card is best for a chosen category?
  - did I already fill this month?

### Interaction patterns
- Use modals/drawers/forms for editing.
- Use confirmation for destructive actions.
- Show empty states, loading states, and error states.

### UI language
- Russian.

---

## Suggested Folder Structure
```txt
src/
  app/
    (auth)/
    dashboard/
    api/
  components/
    auth/
    dashboard/
    banks/
    cards/
    categories/
    shared/
  lib/
    auth/
    db/
    validation/
    utils/
  server/
    services/
    repositories/
  hooks/
  types/
  styles/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  integration/
  e2e/
```

Adapt if needed, but keep boundaries clear.

---

## Validation Rules
- Validate forms on both client and server.
- `percent` must be numeric and sane.
- Required names cannot be empty.
- Month keys must be normalized.
- Import JSON must be validated before write.

---

## Import / Export Rules
### Export
- Export only the authenticated user's data.
- Use stable JSON structure.
- Include months, banks, cards, and cashback categories.

### Import
- Validate schema before insert.
- Decide and document whether import:
  - merges;
  - replaces selected month;
  - or creates missing months.
- Prefer import preview before destructive operations.

---

## Copy Month Rules
When creating a new month from an old one:
- copy banks;
- copy cards;
- copy cashback categories;
- create new ids;
- preserve ordering where possible;
- do not mutate old month data.

Use a DB transaction.

---

## Performance Rules
- Avoid over-fetching.
- Prefer server-side fetching for initial dashboard load.
- Cache only where it helps and does not risk stale business data confusion.
- Index foreign keys and common lookup fields.

---

## Security Rules
- Hash passwords securely.
- Protect secrets via environment variables.
- Never commit `.env`.
- Sanitize and validate all input.
- Rate limit auth endpoints if practical.
- Audit import functionality carefully.

---

## Testing Rules
### Minimum
- Unit tests for core helpers and validation
- Integration tests for API/service logic
- E2E tests for:
  - sign up/sign in
  - create month
  - copy month
  - add bank/card/category
  - filter by category

### Important
Do not rely only on manual clicking and optimism.

---

## Coding Style Rules
- Prefer explicit names over short clever names.
- Keep components focused.
- Extract server logic from route files when complexity grows.
- Use comments sparingly and only where they add real value.
- Do not create abstraction layers “for future flexibility” unless there is an actual second use case.

---

## Definition of Done
A task is done only if:
- feature works;
- types are correct;
- validation exists;
- auth/ownership is respected;
- empty/loading/error states are handled;
- no obvious regression is introduced.

---

## Nice-to-Have After MVP
- best category summary
- pinned banks
- favorite categories
- reminders to fill a new month
- analytics on recurring categories
- PWA support

---

## Anti-Patterns to Avoid
- Frontend-only storage for core data
- One huge page component with all logic inside
- Silent failing forms
- Unscoped DB queries
- Giant global state for everything
- Premature microservices
- “Temporary” hacks that become architecture

---

## Agent Execution Instructions
When working on this project, the agent should:
1. inspect existing architecture before adding new code;
2. preserve type safety;
3. respect domain boundaries;
4. avoid rewriting unrelated parts;
5. prefer small, testable changes;
6. explain tradeoffs when changing schema or auth;
7. update migrations and types together;
8. keep UI consistent with existing patterns.

If a requested change conflicts with these rules, the agent should prefer maintainability and security over speed.
