# BI Dashboard MVP

A minimal Business Intelligence dashboard with drilldown capabilities for time-series and category breakdowns.

## Features

- **KPI Cards**: Total amount, total quantity, average amount per day
- **Time-Series Chart**: Monthly/weekly/daily views with drilldown
- **Breakdown Chart**: Category and sub-category views with drilldown
- **Data Table**: Server-side paging, sorting, and filtering
- **Drilldown/Roll-up**: Navigate through time grains (month→week→day) and category hierarchies

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Recharts + TanStack Table
- **Backend**: FastAPI + Uvicorn + SQLAlchemy + Alembic
- **Database**: PostgreSQL 15
- **Containerization**: Docker Compose v2

## Prerequisites

- Docker and Docker Compose v2
- Git
- WSL2 (for Windows users)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd bi
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker compose up
```

4. Access the dashboard:
   - Frontend: http://localhost:3000/dashboard
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/healthz

## Project Structure

```
.
├── backend/          # FastAPI application
│   ├── alembic/     # Database migrations
│   ├── app/         # Application code
│   └── Dockerfile
├── frontend/        # Next.js application
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   └── Dockerfile
├── compose.yaml     # Docker Compose configuration
└── README.md
```

## API Endpoints

### Health
- `GET /healthz` - Health check endpoint

### Metadata
- `GET /api/meta/categories` - List all categories
- `GET /api/meta/sub_categories?category=<category>` - List sub-categories for a category

### Data
- `GET /api/kpis?date_from=<date>&date_to=<date>&category=<cat>&sub_category=<sub>` - KPI metrics
- `GET /api/timeseries?date_from=<date>&date_to=<date>&grain=<month|week|day>&category=<cat>&sub_category=<sub>` - Time-series data
- `GET /api/breakdown?date_from=<date>&date_to=<date>&group_by=<category|sub_category>&category=<cat>&sub_category=<sub>` - Breakdown data
- `GET /api/rows?date_from=<date>&date_to=<date>&limit=<n>&offset=<n>&order_by=<col>&order_dir=<asc|desc>&category=<cat>&sub_category=<sub>` - Paginated table data

## Setup and Run

### First Time Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd bi
```

2. Copy environment file (optional, defaults are in compose.yaml):
```bash
cp .env.example .env
# Edit .env if needed
```

3. Start all services:
```bash
docker compose up
```

This will:
- Start PostgreSQL database
- Run Alembic migrations
- Start FastAPI backend on port 8000
- Start Next.js frontend on port 3000

**Note:** On first run, you need to seed the database manually:

```bash
# In a new terminal, after services are up
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed.py
```

### Access the Application

- **Dashboard**: http://localhost:3000/dashboard
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/healthz

## Database Reset

To reset the database and reseed data:

```bash
# Full reset (removes all data)
docker compose down -v
docker compose up -d db
# Wait 5-10 seconds for DB to be ready
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed.py
docker compose up
```

For more reset options, see RUNBOOK.md.

## Testing

### Backend Tests
```bash
docker compose exec backend pytest
```

### Linting
```bash
# Backend
docker compose exec backend black --check .
docker compose exec backend ruff check .

# Frontend
docker compose exec frontend npm run lint
```

### Format Code
```bash
# Backend
docker compose exec backend black .
docker compose exec backend ruff check --fix .

# Frontend
docker compose exec frontend npm run format
```

## Development

### Backend
- Code location: `backend/app/`
- Migrations: `backend/alembic/`
- Run migrations: `docker compose exec backend alembic upgrade head`

### Frontend
- Code location: `frontend/app/` and `frontend/components/`
- Hot reload enabled in development mode

## Drilldown Usage

### Time Drilldown
1. Default view shows monthly aggregation
2. Click a month bar/point to drill down to weeks
3. Click a week to drill down to days
4. Use breadcrumb to roll up: `Time: Month > Week(2025-W35) > Day`

### Category Drilldown
1. Default breakdown shows categories
2. Click a category bar to drill down to sub-categories
3. Use breadcrumb to roll up: `Category: All > Pumps > SubCategory`

## Demo Steps

1. **Start the application:**
   ```bash
   docker compose up
   ```
   Wait for all services to be ready (check logs).

2. **Seed the database (first time only):**
   ```bash
   docker compose exec backend alembic upgrade head
   docker compose exec backend python scripts/seed.py
   ```

3. **Open the dashboard:**
   - Navigate to http://localhost:3000/dashboard

4. **Test filters:**
   - Change date range (default: last 90 days)
   - Select a category from dropdown
   - Select a sub-category (enabled when category is selected)
   - Click "Refresh" to reload data
   - Click "Clear Filters" to reset

5. **Test time drilldown:**
   - Default view shows monthly aggregation
   - Click a point on the time-series chart to drill down to weeks
   - Click a week point to drill down to days
   - Use breadcrumb "Time: Month > Week(...)" to roll up

6. **Test category drilldown:**
   - Default breakdown shows categories
   - Click a category bar to drill down to sub-categories
   - Use breadcrumb "Category: All > ..." to roll up

7. **Test table:**
   - Click column headers to sort (ascending/descending)
   - Use pagination controls to navigate pages
   - Verify data matches filtered KPIs and charts

8. **Verify consistency:**
   - Apply filters and note KPI values
   - Drill down in time/category
   - Verify KPIs, charts, and table all reflect the same filtered scope

## Known Issues

See RUNBOOK.md for common issues and solutions.

## License

MIT

