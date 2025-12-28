<div align="center">
  <br />
  <h1>💰 FinTrack</h1>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.js_16-black?style=for-the-badge&logoColor=white&logo=next.js&color=000000" alt="Next.js" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=4169E1" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/-Drizzle_ORM-black?style=for-the-badge&logoColor=white&logo=drizzle&color=C5F74F" alt="Drizzle ORM" />
  </div>

  <h3 align="center">A Smart, Multi-Currency Personal Finance Manager</h3>

   <div align="center">
     It handles <b>OCR Receipt Scanning</b>, <b>Investment Portfolios</b>, and <b>Real-Time Currency Conversion</b>.
   </div>

   <br />

   <div align="center">
     <a href="https://moe-finance-manager.vercel.app/">
       <img src="https://img.shields.io/badge/🌐_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
     </a>
   </div>
</div>

## 📋 Table of Contents
- [📍 Overview](#-overview)
- [📦 Features](#-features)
- [🤖 Tech Stack & Architecture](#-tech-stack--architecture)
- [📸 Screenshots](#-screenshots)
- [🔧 Engineering Highlights](#-engineering-highlights)
- [🚀 Getting Started](#-getting-started)
- [🎭 Demo Account](#-demo-account)
- [🚀 Deployment](#-deployment)
- [📝 Environment Variables](#-environment-variables)
- [🗄️ Database Setup](#️-database-setup)
- [📚 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)

---

## 📍 Overview

**FinTrack** is a comprehensive financial management platform designed to solve the complexity of tracking wealth across borders and asset classes. Unlike standard expense trackers, FinTrack supports **multi-currency accounts** (USD, EUR, GBP, SEK) with real-time conversion and includes a dedicated **investment portfolio manager** for stocks and crypto.

It leverages **OCR technology (Tesseract.js)** to automate data entry from physical receipts and provides deep analytics through interactive visualizations.

**🌐 Try it live:** [https://moe-finance-manager.vercel.app/](https://moe-finance-manager.vercel.app/)

---

## 📦 Features

### 💰 Smart Money Management
- **Multi-Currency System:** Create accounts in USD, EUR, GBP, or SEK. The dashboard unifies your net worth into a single base currency using real-time exchange rates (Frankfurter API).
- **Receipt Scanning:** Upload a receipt image, and the app automatically parses the total amount, date, and merchant name using OCR technology.
- **Recurring Transactions:** Set up daily, weekly, monthly, or yearly automated transaction rules.
- **Transaction Categories & Sources:** Organize expenses by custom categories and track income sources (e.g., YouTube, Freelance, Salary).

### 📈 Investment Portfolio
- **Asset Tracking:** Monitor Stocks and Crypto holdings across multiple investment accounts.
- **Performance Metrics:** Auto-calculation of Cost Basis, Total Gain/Loss, and Portfolio Percentage.
- **Transaction History:** Track buy/sell transactions with automatic holding calculations.
- **Portfolio Summary:** Real-time portfolio value and performance across all investment accounts.

### 📊 Analytics & Goals
- **Interactive Dashboards:** Visual breakdown of Income vs. Expenses and Category usage (Pie/Bar charts via Recharts).
- **Period Analysis:** Switch between monthly and yearly views with comprehensive statistics.
- **Goal Tracking:** Set savings targets with visual progress bars linked to specific accounts.
- **Expense Insights:** Identify frequent recurring expenses and top single expenses.
- **Income Source Analytics:** Track and visualize top income sources.

### 🔒 Security & User Management
- **Clerk Authentication:** Secure user authentication with email/password and social logins.
- **Data Isolation:** All user data is scoped by user ID at the database level.
- **Protected Routes:** Middleware-based route protection for secure access.

---

## 🤖 Tech Stack & Architecture

This project uses a modern **Server-First** architecture to ensure type safety and performance.

| **Layer** | **Technology** |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **UI Components** | Shadcn UI (Radix Primitives), Recharts, Lucide React |
| **Forms & Validation** | React Hook Form, Zod |
| **Backend Logic** | Next.js Server Components & Server Actions |
| **Database** | PostgreSQL (Neon Serverless), Drizzle ORM |
| **Auth & Security** | Clerk (Middleware Protection), Zod Validation |
| **External APIs** | Tesseract.js (OCR), Frankfurter API (Currency Exchange) |

### Architecture Highlights
- **Server Components:** Data fetching happens on the server for optimal performance
- **Server Actions:** Type-safe mutations with React Server Actions
- **Type Safety:** End-to-end TypeScript from database schema to UI components
- **Optimistic UI:** Instant feedback with background processing
- **Parallel Data Fetching:** Minimized waterfall requests using `Promise.all()`

---

## 🔧 Engineering Highlights

This is not just a UI wrapper; it features complex backend logic and database optimization:

### 1. Advanced Database Design (PostgreSQL + Drizzle)
- **Normalized Schema:** Strict relationships with Foreign Keys and Cascade Deletes to ensure data integrity.
- **Data Isolation:** All queries are scoped by `Clerk User ID` at the database level, preventing data leaks between users.
- **Type Safety:** Full end-to-end type safety from the DB schema to the React component using Drizzle and TypeScript.
- **Multi-Currency Support:** Separate `accountCurrencies` table for accounts holding multiple currencies.

### 2. Performance Optimization
- **Optimistic UI:** The interface updates instantly when adding transactions, while the Server Action processes in the background.
- **Parallel Data Fetching:** Dashboard widgets load simultaneously using `Promise.all()` inside Server Components to minimize waterfalls.
- **Next.js Caching:** Exchange rates are cached for 24 hours to reduce API limits and improve load times.
- **Suspense Boundaries:** Progressive loading with skeleton states for better UX.

### 3. Complex Business Logic
- **Weighted Average Calculation:** For investment portfolios to track accurate cost basis after multiple buy/sell orders.
- **Intelligent Parsing:** Custom Regex logic cleans raw OCR text output to accurately identify prices, dates, and merchant names from messy receipt images.
- **Currency Conversion:** Real-time exchange rate fetching with automatic conversion for unified financial views.
- **Savings Rate Calculation:** Automatic calculation of net savings and savings rate percentage.

### 4. User Experience
- **Responsive Design:** Mobile-first approach with Tailwind CSS breakpoints.
- **Accessibility:** ARIA labels, keyboard navigation, and semantic HTML.
- **Dark Mode:** Built-in dark mode support with CSS variables.
- **Loading States:** Comprehensive loading skeletons and error handling.

---

## 📸 Screenshots

<div align="center">
  <img src="public/screenshots/1.png" alt="Dashboard Overview" width="800" />
  <p><em>Dashboard Overview</em></p>
  
  <img src="public/screenshots/2.png" alt="" width="800" />
  
  <img src="public/screenshots/3.png" alt="Transaction Management" width="800" />
  <p><em>Transaction Management</em></p>
  
  <img src="public/screenshots/4.png" alt="Transaction Details" width="800" />
  <p><em>Transaction Details</em></p>
  
  <img src="public/screenshots/5.png" alt="Accounts management" width="800" />
  <p><em>Accounts management</em></p>
  
  <img src="public/screenshots/6.png" alt="Goals management" width="800" />
  <p><em>Goals management</em></p>
  
  <img src="public/screenshots/7.png" alt="Investemnt Tracking" width="800" />
  <p><em>Investemnt Tracking</em></p>
  
  <img src="public/screenshots/8.png" alt="Settings & Configuration" width="800" />
  <p><em>Crypto account view</em></p>
</div>

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (recommended: 20+)
- **PostgreSQL Database** (Neon recommended for serverless)
- **Clerk Account** (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/1Realmoe/FinTrack.git
   cd FinTrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory (see [Environment Variables](#-environment-variables) section below).

4. **Set up the database**
   
   See the [Database Setup](#️-database-setup) section below.

5. **Run database migrations**
   ```bash
   npm run db:push
   # or
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🎭 Demo Account

For testing purposes, you can use the following demo account credentials:

- **Email:** `demo@demo.com`
- **Password:** `demo4321-`

> **Note:** This demo account is for testing only. Please do not use it for production data.

### 🚀 Deployment

This application is designed to be deployed on **Vercel** for optimal performance with Next.js.

**🌐 Live Demo:** [https://moe-finance-manager.vercel.app/](https://moe-finance-manager.vercel.app/)

**Quick Deploy:**
1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard
4. Deploy!

Vercel will automatically:
- Build your Next.js application
- Set up serverless functions
- Configure edge network for global performance
- Handle automatic deployments on git push

### Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (⚠️ destructive) |

---

## 📝 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Clerk Webhook Secret (if using webhooks)
CLERK_WEBHOOK_SECRET=whsec_...
```

### Getting Your Credentials

1. **Database (Neon)**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string from the dashboard

2. **Clerk**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the publishable key and secret key from the API Keys section

---

## 🗄️ Database Setup

### Option 1: Using Neon (Recommended)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string and add it to `.env.local` as `DATABASE_URL`
4. Run migrations:
   ```bash
   npm run db:push
   ```

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
   ```sql
   CREATE DATABASE fintrack;
   ```
3. Update `DATABASE_URL` in `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/fintrack
   ```
4. Run migrations:
   ```bash
   npm run db:push
   ```

### Database Management

- **View Database:** `npm run db:studio` (opens Drizzle Studio)
- **Generate Migrations:** `npm run db:generate` (after schema changes)
- **Apply Migrations:** `npm run db:migrate`
- **Reset Database:** `npm run db:reset` (⚠️ deletes all data)

---

## 📚 Project Structure

```
FinTrack/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard pages
│   │   ├── accounts/       # Account management
│   │   ├── transactions/  # Transaction tracking
│   │   ├── investments/    # Investment portfolio
│   │   ├── goals/          # Financial goals
│   │   └── ...
│   ├── signin/             # Authentication pages
│   └── signup/
├── components/
│   ├── features/           # Feature-specific components
│   └── ui/                  # Reusable UI components (Shadcn)
├── contexts/               # React contexts (currency, balance visibility)
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   ├── index.ts            # Database connection
│   └── reset.ts            # Database reset utility
├── lib/
│   ├── actions/            # Server Actions
│   ├── data/               # Data fetching functions
│   ├── currency.ts         # Currency utilities
│   ├── exchange.ts         # Exchange rate logic
│   └── format.ts           # Formatting utilities
├── drizzle/                # Database migrations
└── public/                  # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Use TypeScript for all new code
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Clerk](https://clerk.com/) for authentication
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/1Realmoe">1Realmoe</a></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
