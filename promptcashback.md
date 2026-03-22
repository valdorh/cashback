# Antigravity Prompt — Web-приложение для контроля кэшбэков

## Objective
Build a full-stack web application for tracking monthly cashback categories across multiple banks and cards.

The app must let a user:
- create cashback data for each month;
- store cashback categories for different banks and cards;
- open the app at any time from any device;
- instantly see current month's cashback categories;
- view previous months;
- edit data easily;
- securely store everything on the backend.

This is a real personal productivity app, not a demo toy.

---

## Product Goal
Create a modern, mobile-friendly cashback tracker where the user can manage monthly cashback offers from different banks and cards in one place.

The app must support:
- multiple months;
- multiple banks;
- multiple cards per bank;
- multiple cashback categories per card;
- user authentication;
- backend database persistence;
- access from different devices.

---

## Core User Scenario
1. User signs in.
2. The app opens the current month automatically.
3. User sees all banks and cards for the selected month.
4. User sees cashback categories and percentages for each card.
5. User can add or edit banks, cards, and cashback categories.
6. User can switch to another month.
7. User can copy last month's setup into a new month and edit it.
8. User can use the same account on phone, tablet, and desktop.

---

## Mandatory Requirements
### Backend is required
Do not build a frontend-only app.

### Database is required
Do not use localStorage as the primary source of truth.

### Authentication is required
Each user must only see their own data.

### Mobile-first UI is required
The app must work well on phone screens first, then desktop.

---

## Recommended Stack
Use this stack unless there is a very strong reason not to:
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth or custom JWT auth

If you choose a different stack, keep the same architecture quality:
- frontend + backend
- typed models
- secure auth
- real database
- scalable code structure

---

## Data Model
Design the system around these entities:

### User
- id
- email
- passwordHash
- createdAt

### Month
- id
- userId
- key (example: "2026-03")
- label (example: "March 2026")
- createdAt

### Bank
- id
- monthId
- name
- position
- createdAt

### Card
- id
- bankId
- name
- type (optional)
- note (optional)
- position
- createdAt

### CashbackCategory
- id
- cardId
- name
- percent
- limit (optional)
- comment (optional)
- isPromoted (boolean)
- position
- createdAt

Make sure relations are well designed and cascade behavior is handled correctly.

---

## Required Features

### 1. Authentication
Implement:
- sign up with email + password;
- sign in with email + password;
- sign out;
- protected routes;
- only the owner's data is accessible.

Security requirements:
- passwords must be hashed;
- authentication must be secure;
- validation and error messages must be included.

### 2. Month Management
Implement:
- auto-open current month after login;
- create month;
- switch between months;
- copy previous month into a new one;
- show empty state when a month has no data.

### 3. Bank Management
Implement:
- add bank;
- edit bank name;
- delete bank;
- reorder banks if practical.

### 4. Card Management
Implement:
- add card inside a bank;
- edit card;
- delete card;
- optional fields for card type and note.

### 5. Cashback Categories
Implement:
- add cashback category to a card;
- edit category;
- delete category;
- support fields:
  - category name
  - cashback percent
  - optional limit
  - optional comment
  - optional promoted flag

Examples:
- Supermarkets — 5%
- Gas stations — 10%
- Cafes & restaurants — 7%
- Marketplaces — 3%
- Pharmacies — 5%

### 6. Overview Screen
Create a main dashboard showing:
- selected month;
- list of banks;
- cards inside each bank;
- cashback categories for each card;
- prominent cashback percentages;
- good readability on mobile.

### 7. Search and Filtering
Implement:
- search by bank name;
- search by card name;
- filter by cashback category;
- mode: show all cards where selected category exists.

Example:
User selects "Gas stations" and sees all matching cards across all banks for the chosen month.

### 8. Import / Export
Implement:
- export all user data to JSON;
- import data from JSON;
- simple backup / restore flow.

---

## UX / UI Requirements
The interface must be:
- clean;
- modern;
- fast;
- minimal;
- easy to scan;
- not overloaded.

Use this visual structure:
- top bar with current month selector;
- primary button to add a bank;
- bank cards;
- nested card blocks inside banks;
- cashback categories shown as clean list rows or tags.

Important:
- key information must be visible immediately;
- avoid ugly spreadsheet-like layouts;
- use clear spacing and typography;
- editing should happen via modal, drawer, or dedicated form views;
- UI language must be Russian.

---

## Pages / Screens
Build at least these screens:

1. Authentication page
   - sign in
   - sign up

2. Main dashboard
   - month selector
   - bank list
   - card list
   - cashback categories

3. Month management flow
   - create month
   - copy previous month

4. Import / Export settings screen

5. Optional profile/settings page

---

## Backend / API Requirements
Create a clear backend architecture.

Implement endpoints or server actions for:
- register user
- login user
- logout user
- get current user
- get months
- create month
- copy month
- get banks for month
- create bank
- update bank
- delete bank
- create card
- update card
- delete card
- create cashback category
- update cashback category
- delete cashback category
- export data
- import data

If REST is used, route naming must be clean and consistent.
If server actions are used, logic must still be modular and understandable.

---

## Database Requirements
Use PostgreSQL.
Use Prisma schema with proper relations and indexes where useful.

Provide:
- Prisma schema
- migration-ready structure
- seed example data if appropriate

---

## Engineering Requirements
The code must be:
- production-minded;
- clean;
- maintainable;
- typed;
- modular;
- easy to extend.

Use:
- reusable components;
- typed DTOs or inferred types;
- clear folder structure;
- proper loading and error states;
- form validation;
- empty states.

Do not:
- build a fake mock-only frontend;
- store main business data only in browser memory;
- overengineer with microservices;
- add unnecessary enterprise complexity.

---

## Nice-to-Have Features
If implementation stays clean, add:
- color markers for categories;
- favorite categories;
- pinned banks;
- summary block: best cashback categories this month;
- quick helper: "Where is the best cashback for this category?"

---

## Output Requirements
Generate the result in this order:

1. Architecture overview
2. Stack explanation
3. Folder structure
4. Prisma schema
5. Backend implementation
6. Frontend implementation
7. Auth flow
8. Main UI components
9. Setup instructions
10. Environment variables example
11. Future improvements

---

## Quality Standard
The final result must look like a real usable personal finance productivity product, not a dressed-up CRUD tutorial.

The user should be able to:
- open the app on any device,
- log in,
- immediately see current cashback offers,
- update data in minutes,
- trust that the data is stored safely on the backend.

---

## Final Instruction
Generate complete working code for the MVP.
Do not return only a concept or only a prototype description.
Return actual implementation-ready code and project structure.
