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

## Drilldown and Roll-up Usage

The BI dashboard allows you to drill down into details by clicking on charts and navigate back to higher levels using breadcrumbs.

### 📊 Time Drilldown (Month → Week → Day)

**Initial Display:**
- The time series chart displays data aggregated by **month**
- Data points (blue dots) for each month are shown

**Drilldown Steps:**

1. **Drill from Month to Week**
   - **Click on a month's data point (blue dot)** on the time series chart
   - The view automatically switches to **weekly** data for that month
   - The date range filter is also automatically updated to that month's range
   - The breadcrumb shows `Time: Month > Week(2025-09)`

2. **Drill from Week to Day**
   - In the weekly view, **click on a week's data point**
   - The view automatically switches to **daily** data for that week
   - The breadcrumb shows `Time: Month > Week(2025-09) > Day`

**Roll-up Steps:**

- **Click on the breadcrumb** to return to a higher level
  - Click **"Month"** in `Time: Month > Week(...)` → Returns to monthly view
  - Click **"Week(...)"** in `Time: Month > Week(...) > Day` → Returns to weekly view
- When rolling up, the date range also returns to the original range (default: last 90 days)

**Note:**
- Daily view is the lowest level and cannot be drilled down further
- When items are not clickable, the cursor shows as a normal arrow

### 🏷️ Category Drilldown (Category → Sub-Category)

**Initial Display:**
- The breakdown chart displays data aggregated by **category**
- Bar charts for each category (e.g., Pumps, Valves, Filters) are shown

**Drilldown Steps:**

1. **Drill from Category to Sub-Category**
   - **Click on a category's bar** in the breakdown chart
   - The view automatically switches to **sub-category** level data for that category
   - The category filter is also automatically set to the selected category
   - The breadcrumb shows `Category: All > Pumps`

**Roll-up Steps:**

- **Click "All" in the breadcrumb** to return to category level
  - Click **"All"** in `Category: All > Pumps` → Returns to all categories view
- When rolling up, the category filter is also cleared

**Note:**
- Sub-category view is the lowest level and cannot be drilled down further
- When items are not clickable, the cursor shows as a normal arrow

### 🔄 Data Synchronization

When performing drilldown or roll-up, the following elements are **automatically synchronized** and updated:

- ✅ **KPI Cards** (total amount, total quantity, averages, etc.)
- ✅ **Time Series Chart** (time grain changes)
- ✅ **Breakdown Chart** (aggregation level changes)
- ✅ **Data Table** (displayed data updates according to filters)
- ✅ **Date Range Filter** (automatically updated during time drilldown)

### 💡 Usage Tips

1. **Combine with Filters**
   - It's efficient to set date range or category filters first, then drill down
   - Use the "Refresh" button to apply filters

2. **Check Current Position with Breadcrumbs**
   - The breadcrumb at the top shows which level you're currently viewing
   - Clickable items are shown in blue and can be clicked to roll up

3. **View Details Progressively**
   - First understand the overall picture (monthly, category level)
   - Click on interesting periods or categories to see details
   - Use breadcrumbs to navigate back when needed

### 🎯 Usage Examples

**Example 1: View Weekly Trends for a Specific Month**
1. Click on a month's point in the time series chart
2. Weekly data for that month is displayed
3. Click on a week to see daily data
4. Click "Month" in the breadcrumb to return to monthly view

**Example 2: View Sub-Category Breakdown for a Specific Category**
1. Click on the "Pumps" bar in the breakdown chart
2. Sub-category data for Pumps is displayed
3. Click "All" in the breadcrumb to return to all categories view

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
   - Initial display shows monthly aggregation
   - **Click on a blue dot (month's data point) in the time series chart** → Switches to weekly data for that month
   - **Click on a week's data point** → Switches to daily data for that week
   - **Click "Month" in the breadcrumb** → Returns to monthly view
   - Verify that KPI cards, charts, and table all update together

6. **Test category drilldown:**
   - Initial display shows category-level aggregation
   - **Click on a bar in the breakdown chart (e.g., "Pumps")** → Switches to sub-category data for that category
   - **Click "All" in the breadcrumb** → Returns to all categories view
   - Verify that the category filter is automatically set

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

