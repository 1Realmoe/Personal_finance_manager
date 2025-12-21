# Project Specification: Personal Finance Dashboard "FinTrack"

## 1. Project Overview
We are building a modular, scalable Personal Finance Dashboard to track bank accounts, transactions, and money flow.
- **Goal:** Track income/expenses for the new year with full CRUD capabilities.
- **Future Proofing:** The backend must be modular to allow for easy database switching or AI integration later.
- **Stack:**
  - **Framework:** Next.js 16 (App Router, Server Actions, Turbo).
  - **Language:** TypeScript.
  - **Database:** Neon (Serverless Postgres).
  - **ORM:** Drizzle ORM (Best for modularity and type safety).
  - **UI Library:** Shadcn UI + Tailwind CSS.
  - **Charts:** Recharts (via Shadcn charts).
  - **Icons:** Lucide React.
  - **Validation:** Zod.

## 2. Core Architecture Rules
1.  **Server Actions Only:** Do NOT use API Routes (`pages/api` or `app/api`). Use Next.js 16 Server Actions for all CRUD operations (`actions/`).
2.  **Data Access Layer:** Create a distinct separation of concerns. UI components should call Server Actions -> Server Actions call Service Layer -> Service Layer calls Database. This ensures we can swap the DB later without touching the UI.
3.  **SSR First:** Fetch data in Server Components (`page.tsx`) and pass it to Client Components only when interactivity is needed. Use `<Suspense>` for loading states.
4.  **No Auth (Yet):** Hardcode a simple user ID (e.g., `user_1`) for now to simulate an authenticated session, but design schemas to support `userId` columns from day one.

## 3. Database Schema (Drizzle/Neon)
We need the following tables in `schema.ts`. Use snake_case for DB columns, camelCase for TS objects.

* **Accounts**
    * `id` (UUID, PK)
    * `name` (Text - e.g., "Chase Checking")
    * `type` (Enum: "CURRENT", "SAVINGS", "CASH")
    * `balance` (Decimal - current balance)
    * `color` (String - hex code for UI badging)

* **Categories**
    * `id` (UUID, PK)
    * `name` (Text - e.g., "Groceries", "Salary")
    * `type` (Enum: "INCOME", "EXPENSE")
    * `icon` (String - name of the Lucide icon)

* **Transactions**
    * `id` (UUID, PK)
    * `amount` (Decimal)
    * `description` (Text)
    * `date` (Timestamp)
    * `accountId` (FK -> Accounts.id)
    * `categoryId` (FK -> Categories.id, nullable)
    * `type` (Enum: "INCOME", "EXPENSE")

## 4. UI/UX Features & Components
* **Dashboard (`/`)**:
    * **Summary Cards:** Total Balance, Monthly Income, Monthly Expense (Use Shadcn `Card`).
    * **Recent Transactions:** A reduced list of the last 5 transactions.
    * **Overview Chart:** A Bar chart showing daily spending for the current month.
* **Transactions Page (`/transactions`)**:
    * Data Table (Shadcn `Table`) with sorting/filtering.
    * "Add Transaction" Sheet/Modal (Shadcn `Sheet`) containing a form.
* **Accounts Page (`/accounts`)**:
    * List of bank accounts with their live balances.
    * Ability to Edit/Delete accounts.

## 5. Folder Structure
```text
/app
  /(dashboard)      # Layout for sidebar/nav
    /page.tsx       # Main dashboard
    /transactions/
    /accounts/
/components
  /ui               # Shadcn primitives
  /features         # App-specific widgets (TransactionForm, AccountCard)
/db
  schema.ts         # Drizzle schema
  index.ts          # DB connection
/lib
  /actions          # Server Actions (mutations)
  /data             # Data Fetching functions (queries)
  utils.ts