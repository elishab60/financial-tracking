# Technical Report: Budget Planner Feature

## 1. UI Tokens & Design System
The project uses a premium dark SaaS aesthetic with deep navy backgrounds and cyan/gold accents.

- **Palette**:
  - `background`: `oklch(0.08 0.01 250)` (Deep Navy)
  - `primary`: `oklch(0.7 0.15 220)` (Sophisticated Cyan)
  - `gold`: `#c5a059` / `#e2c695` (Premium accents)
  - `foreground`: `oklch(0.98 0 0)`
  - `card`: `rgba(10, 15, 25, 0.4)` with glassmorphism effects.
- **Radius**: `1.5rem` (Large), `1rem` (Medium), `0.6rem` (Small).
- **Aesthetics**: Heavy use of glassmorphism (`.glass-card`), subtle radial gradients, and premium typography.

## 2. Technical Architecture
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod + React Hook Form
- **Database**: Supabase (PostgreSQL + RLS)
- **Charts**: Recharts / Lightweight Charts

## 3. Implementation Plan: Budget Planner

### 3.1 Data Model
We will introduce new tables in Supabase:
- `budget_categories`: Stores the monthly budget targets for each category/pole.
  - `id`, `user_id`, `name`, `target_amount`, `icon`, `color`.
- `budget_income`: Stores monthly income sources.
  - `id`, `user_id`, `name`, `amount`, `is_recurring`.
- `transactions`: (Reuse existing table) but ensuring Category mapping works well.

### 3.2 Feature Structure
- `/budget`: Root route for the planner.
- `src/components/budget/`:
  - `budget-dashboard.tsx`: Main container.
  - `budget-kpi-cards.tsx`: Income, Spent, Remaining.
  - `budget-allocation-chart.tsx`: Donut chart.
  - `budget-vs-actual-chart.tsx`: Comparative bar chart.
  - `budget-categories-list.tsx`: Management of poles.
  - `budget-transactions-table.tsx`: Filterable list of expenses.
  - `add-expense-drawer.tsx`: Form to add new spending.
  - `budget-assistant.tsx`: Automated recommendations.

### 3.3 Technical Decisions
1. **Persistence**: We will prioritize Supabase for storage to ensure cross-device consistency. 
2. **Library for Exports**:
   - `xlsx` for Excel exports.
   - `jspdf` + `jspdf-autotable` for PDF exports.
3. **Budget Calculations**: Computed on-the-fly using React Query selectors for optimal performance and reactivity.
