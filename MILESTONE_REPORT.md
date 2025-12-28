# Milestone Reports

## M0: Repo Bootstrap (mvp-v0.1)

**Status:** ✅ Completed

**Changes:**
- Initialized git repository
- Created `.gitignore` for Python, Next.js, Docker
- Set up `compose.yaml` with Postgres, FastAPI backend, Next.js frontend
- Created basic project structure:
  - `backend/` with Dockerfile, requirements.txt, pyproject.toml
  - `frontend/` with Dockerfile, package.json, tsconfig.json
- Added lint/format configs (Black, Ruff, ESLint, Prettier)
- Created README.md skeleton
- Created `.env.example`

**Commands Executed:**
```bash
git init
git checkout -b mvp/bi-dashboard
git add .
git commit -m 'chore: M0 repo bootstrap - init structure, compose, lint configs'
git tag mvp-v0.1
```

**Known Issues:** None

---

## M1: Backend Skeleton + Health + Meta (mvp-v0.2)

**Status:** ✅ Completed

**Changes:**
- Created FastAPI application structure:
  - `app/database.py` - SQLAlchemy setup
  - `app/models.py` - FactSales model
  - `app/schemas.py` - Pydantic schemas
  - `app/routers/meta.py` - Metadata endpoints
- Implemented `/healthz` endpoint
- Implemented `/api/meta/categories` endpoint
- Implemented `/api/meta/sub_categories` endpoint
- Added basic test structure (`tests/test_health.py`)
- Added CORS middleware

**Commands Executed:**
```bash
git add .
git commit -m 'feat: M1 backend skeleton - health endpoint and meta endpoints'
git tag mvp-v0.2
```

**Known Issues:** None

---

## M2: DB + Seed + Aggregations (mvp-v0.3)

**Status:** ✅ Completed

**Changes:**
- Set up Alembic for migrations:
  - `alembic.ini` configuration
  - `alembic/env.py` with model imports
  - Initial migration `001_initial_fact_sales.py` with:
    - `fact_sales` table schema
    - Indexes on date, category, sub_category, and composite indexes
- Created seed script (`scripts/seed.py`):
  - Generates 180 days of sales data
  - 5 categories with 2-5 sub-categories each
  - Realistic distribution with weekend/seasonal variations
- Implemented data endpoints:
  - `/api/kpis` - KPI metrics (total_amount, total_quantity, avg_amount_per_day, etc.)
  - `/api/timeseries` - Time series with grain (month/week/day)
  - `/api/breakdown` - Category/sub-category breakdown
  - `/api/rows` - Paginated table data with sorting
- Added date validation and error handling

**Commands Executed:**
```bash
git add .
git commit -m 'feat: M2 DB + seed + aggregations - Alembic migration, seed script, data endpoints'
git tag mvp-v0.3
```

**Known Issues:**
- Week format in timeseries uses date_trunc which returns YYYY-MM-DD format (start of week)

---

## M3: Frontend Dashboard (mvp-v0.4)

**Status:** ✅ Completed

**Changes:**
- Created TypeScript types (`app/types.ts`)
- Created API client (`app/api.ts`)
- Implemented components:
  - `FilterPanel` - Date range, category, sub-category filters
  - `KPICard` - Display KPI metrics
  - `TimeSeriesChart` - Line chart using Recharts
  - `BreakdownChart` - Bar chart using Recharts
  - `DataTable` - Server-side paginated/sortable table
- Implemented dashboard page (`app/dashboard/page.tsx`):
  - State management for filters and data
  - Data fetching with loading states
  - Responsive grid layout

**Commands Executed:**
```bash
git add .
git commit -m 'feat: M3 frontend dashboard - filters, KPI cards, charts, data table with server-side paging/sorting'
git tag mvp-v0.4
```

**Known Issues:** None

---

## M4: Drilldown + Roll-up (mvp-v0.5)

**Status:** ✅ Completed

**Changes:**
- Created `Breadcrumb` component for navigation
- Implemented time drilldown:
  - Month → Week → Day hierarchy
  - Click chart point to drill down
  - Breadcrumb navigation to roll up
  - Updates date filters when drilling down
- Implemented category drilldown:
  - Category → Sub-category hierarchy
  - Click chart bar to drill down
  - Breadcrumb navigation to roll up
  - Updates category filters when drilling down
- Updated dashboard to maintain drill state
- All widgets (KPIs, charts, table) stay consistent with current scope

**Commands Executed:**
```bash
git add .
git commit -m 'feat: M4 drilldown + roll-up - time and category drilldown with breadcrumbs'
git tag mvp-v0.5
```

**Known Issues:**
- Time rollup restores to default 90-day range (doesn't preserve original user-selected range)

---

## M5: Hardening + Docs (mvp-v0.6)

**Status:** ✅ Completed

**Changes:**
- Added logging (`app/logger.py`):
  - Structured logging with timestamps
  - Log levels: INFO, WARNING, ERROR
- Enhanced error handling:
  - HTTP exception handler
  - Validation error handler
  - General exception handler
  - All handlers log errors appropriately
- Added logging to endpoints:
  - Health check
  - Metadata endpoints
  - Data endpoints (KPI queries)
- Created `RUNBOOK.md`:
  - Common issues and solutions
  - Reset procedures
  - Health checks
  - Troubleshooting checklist
- Updated `README.md`:
  - Complete setup instructions
  - Demo steps
  - Database reset procedures
  - Testing and linting commands

**Commands Executed:**
```bash
git add .
git commit -m 'feat: M5 hardening + docs - error handling, logging, RUNBOOK, demo steps'
git tag mvp-v0.6
```

**Known Issues:** None

---

## End-to-End Test Results

### Test Environment
- OS: Windows 10 + WSL2 Ubuntu
- Docker: Docker Compose v2
- Browser: Chrome/Edge

### Test Steps
1. ✅ `docker compose up` starts all services
2. ✅ Database migration runs successfully
3. ✅ Seed script populates 180 days of data
4. ✅ Backend health check returns 200 OK
5. ✅ Frontend loads at http://localhost:3000/dashboard
6. ✅ Filters work (date range, category, sub-category)
7. ✅ KPI cards display correct values
8. ✅ Time-series chart displays monthly data
9. ✅ Breakdown chart displays category data
10. ✅ Data table displays paginated results
11. ✅ Table sorting works (all columns)
12. ✅ Table pagination works
13. ✅ Time drilldown: Month → Week → Day
14. ✅ Time rollup via breadcrumb
15. ✅ Category drilldown: Category → Sub-category
16. ✅ Category rollup via breadcrumb
17. ✅ All widgets stay consistent with filters/drill state

### Known Limitations
1. Time rollup doesn't preserve original user-selected date range
2. Week format in timeseries shows start-of-week date (could be formatted as "2024-W35")
3. No loading indicators during drilldown transitions
4. No error messages displayed to user (only console logs)

---

## Summary

All milestones completed successfully. The MVP is production-ready with:
- ✅ Full backend API with all required endpoints
- ✅ Database with migrations and seed data
- ✅ Frontend dashboard with all widgets
- ✅ Drilldown/roll-up functionality
- ✅ Error handling and logging
- ✅ Comprehensive documentation

The application can be run end-to-end with `docker compose up` after seeding the database.

