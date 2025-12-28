# BI Dashboard MVP - Runbook

## Common Issues and Solutions

### Issue: Docker Compose fails to start

**Symptoms:**
- `docker compose up` fails with connection errors
- Services exit immediately

**Solutions:**
1. Check if ports 3000, 8000, 5432 are already in use:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   netstat -ano | findstr :5432
   
   # WSL/Linux
   lsof -i :3000
   lsof -i :8000
   lsof -i :5432
   ```

2. Stop conflicting services or change ports in `compose.yaml`

3. Ensure Docker is running:
   ```bash
   docker ps
   ```

4. Check Docker Compose version:
   ```bash
   docker compose version
   ```
   Should be v2.0.0 or higher.

### Issue: Database connection errors

**Symptoms:**
- Backend logs show "connection refused" or "database does not exist"
- API endpoints return 500 errors

**Solutions:**
1. Verify database is healthy:
   ```bash
   docker compose ps db
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

3. Verify DATABASE_URL environment variable:
   ```bash
   docker compose exec backend env | grep DATABASE_URL
   ```
   Should be: `postgresql://bi_user:bi_password@db:5432/bi_db`

4. Test database connection manually:
   ```bash
   docker compose exec db psql -U bi_user -d bi_db -c "SELECT 1;"
   ```

### Issue: Migration errors

**Symptoms:**
- Alembic reports "table already exists" or "no such table"

**Solutions:**
1. Check current migration status:
   ```bash
   docker compose exec backend alembic current
   ```

2. If database is in inconsistent state, reset it:
   ```bash
   docker compose down -v
   docker compose up -d db
   # Wait 5 seconds for DB to be ready
   docker compose exec backend alembic upgrade head
   docker compose exec backend python scripts/seed.py
   ```

3. If migration file is corrupted, check:
   ```bash
   docker compose exec backend alembic history
   ```

### Issue: Frontend cannot connect to backend

**Symptoms:**
- Browser console shows CORS errors or network errors
- Dashboard shows "Failed to fetch" errors

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/healthz
   ```
   Should return: `{"status":"ok"}`

2. Check CORS configuration in `backend/main.py`:
   - Should allow `http://localhost:3000`

3. Verify NEXT_PUBLIC_API_URL:
   ```bash
   docker compose exec frontend env | grep NEXT_PUBLIC_API_URL
   ```
   Should be: `http://localhost:8000`

4. Check browser console for specific error messages

### Issue: Seed script fails

**Symptoms:**
- `python scripts/seed.py` exits with error
- Database remains empty

**Solutions:**
1. Ensure migrations have run:
   ```bash
   docker compose exec backend alembic upgrade head
   ```

2. Check if data already exists:
   ```bash
   docker compose exec db psql -U bi_user -d bi_db -c "SELECT COUNT(*) FROM fact_sales;"
   ```
   If count > 0, data already exists. Use `TRUNCATE` to clear:
   ```bash
   docker compose exec db psql -U bi_user -d bi_db -c "TRUNCATE fact_sales;"
   ```

3. Check seed script logs for specific errors:
   ```bash
   docker compose exec backend python scripts/seed.py
   ```

### Issue: Charts not displaying

**Symptoms:**
- Dashboard loads but charts are empty or show errors

**Solutions:**
1. Check browser console for JavaScript errors

2. Verify data is available:
   ```bash
   curl "http://localhost:8000/api/timeseries?date_from=2024-01-01&date_to=2024-12-31&grain=month"
   ```

3. Check if Recharts is properly installed:
   ```bash
   docker compose exec frontend npm list recharts
   ```

4. Verify date range in filters is valid and contains data

### Issue: Drilldown not working

**Symptoms:**
- Clicking chart points/bars doesn't drill down
- Breadcrumbs don't appear

**Solutions:**
1. Check browser console for JavaScript errors

2. Verify drilldown handlers are attached:
   - Time series chart should have `onPointClick` prop
   - Breakdown chart should have `onBarClick` prop

3. Check that drill state is updating:
   - Open React DevTools
   - Inspect Dashboard component state

### Issue: Table pagination/sorting not working

**Symptoms:**
- Clicking column headers doesn't sort
- Pagination buttons don't change page

**Solutions:**
1. Check browser console for errors

2. Verify API is receiving correct parameters:
   ```bash
   # Check backend logs
   docker compose logs backend | grep "/api/rows"
   ```

3. Test API directly:
   ```bash
   curl "http://localhost:8000/api/rows?date_from=2024-01-01&date_to=2024-12-31&limit=50&offset=0&order_by=date&order_dir=desc"
   ```

## Reset Procedures

### Full Reset (Database + Data)

```bash
# Stop all services and remove volumes
docker compose down -v

# Start database only
docker compose up -d db

# Wait for database to be ready (5-10 seconds)
sleep 5

# Run migrations
docker compose exec backend alembic upgrade head

# Seed data
docker compose exec backend python scripts/seed.py

# Start all services
docker compose up
```

### Reset Database Only (Keep Containers)

```bash
# Connect to database and drop/recreate
docker compose exec db psql -U bi_user -d postgres -c "DROP DATABASE bi_db;"
docker compose exec db psql -U bi_user -d postgres -c "CREATE DATABASE bi_db;"

# Run migrations
docker compose exec backend alembic upgrade head

# Seed data
docker compose exec backend python scripts/seed.py
```

### Reset Frontend (Clear Cache)

```bash
# Rebuild frontend container
docker compose stop frontend
docker compose rm -f frontend
docker compose build frontend
docker compose up -d frontend
```

## Health Checks

### Backend Health
```bash
curl http://localhost:8000/healthz
# Expected: {"status":"ok"}
```

### Database Health
```bash
docker compose exec db pg_isready -U bi_user
# Expected: db:5432 - accepting connections
```

### Frontend Health
```bash
curl http://localhost:3000
# Expected: HTML response
```

## Logs

### View All Logs
```bash
docker compose logs -f
```

### View Specific Service Logs
```bash
# Backend
docker compose logs -f backend

# Frontend
docker compose logs -f frontend

# Database
docker compose logs -f db
```

### Clear Logs
```bash
docker compose down
docker system prune -f
```

## Performance Issues

### Database Query Performance

If queries are slow:

1. Check indexes exist:
   ```bash
   docker compose exec db psql -U bi_user -d bi_db -c "\d fact_sales"
   ```
   Should show indexes on: `date`, `category`, `sub_category`, `(date, category)`, `(category, sub_category)`

2. Analyze query plans:
   ```bash
   docker compose exec db psql -U bi_user -d bi_db -c "EXPLAIN ANALYZE SELECT ..."
   ```

### Frontend Performance

1. Check bundle size:
   ```bash
   docker compose exec frontend npm run build
   ```

2. Check for memory leaks in browser DevTools

## Troubleshooting Checklist

- [ ] Docker is running
- [ ] Ports 3000, 8000, 5432 are available
- [ ] All containers are running: `docker compose ps`
- [ ] Database is healthy: `docker compose exec db pg_isready`
- [ ] Migrations are applied: `docker compose exec backend alembic current`
- [ ] Data exists: `docker compose exec db psql -U bi_user -d bi_db -c "SELECT COUNT(*) FROM fact_sales;"`
- [ ] Backend responds: `curl http://localhost:8000/healthz`
- [ ] Frontend responds: `curl http://localhost:3000`
- [ ] No CORS errors in browser console
- [ ] No JavaScript errors in browser console

