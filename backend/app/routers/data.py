"""Data endpoints for KPIs, time series, breakdown, and table rows."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, select, and_, or_, case
from datetime import date, datetime, timedelta
from typing import Optional
from decimal import Decimal

from app.database import get_db
from app.models import FactSales
from app.logger import logger
from app.schemas import (
    KPIsResponse,
    TimeSeriesResponse,
    TimeSeriesPoint,
    BreakdownResponse,
    BreakdownPoint,
    TableResponse,
    TableRow,
)

router = APIRouter(prefix="/api", tags=["data"])


def validate_date_range(date_from: str, date_to: str) -> tuple[date, date]:
    """Validate and parse date range."""
    try:
        from_date = datetime.strptime(date_from, "%Y-%m-%d").date()
        to_date = datetime.strptime(date_to, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if from_date > to_date:
        raise HTTPException(status_code=400, detail="date_from must be <= date_to.")

    return from_date, to_date


def build_filter_query(
    db: Session,
    date_from: date,
    date_to: date,
    category: Optional[str] = None,
    sub_category: Optional[str] = None,
    sku: Optional[str] = None,
):
    """Build base filtered query."""
    query = select(FactSales).where(
        and_(
            FactSales.date >= date_from,
            FactSales.date <= date_to,
        )
    )

    if category:
        query = query.where(FactSales.category == category)
    if sub_category:
        query = query.where(FactSales.sub_category == sub_category)
    if sku:
        query = query.where(FactSales.sku == sku)

    return query


@router.get("/kpis", response_model=KPIsResponse)
async def get_kpis(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sub_category: Optional[str] = Query(None, description="Filter by sub-category"),
    sku: Optional[str] = Query(None, description="Filter by SKU"),
    db: Session = Depends(get_db),
):
    """Get KPI metrics for the filtered date range."""
    logger.info(f"Fetching KPIs: date_from={date_from}, date_to={date_to}, category={category}, sub_category={sub_category}, sku={sku}")
    from_date, to_date = validate_date_range(date_from, date_to)

    # Build base query
    base_query = build_filter_query(db, from_date, to_date, category, sub_category, sku)

    # Build filter conditions for aggregations
    conditions = [
        FactSales.date >= from_date,
        FactSales.date <= to_date,
    ]
    if category:
        conditions.append(FactSales.category == category)
    if sub_category:
        conditions.append(FactSales.sub_category == sub_category)
    if sku:
        conditions.append(FactSales.sku == sku)

    # Calculate aggregations
    result = db.execute(
        select(
            func.sum(FactSales.amount).label("total_amount"),
            func.sum(FactSales.quantity).label("total_quantity"),
            func.count(FactSales.id).label("row_count"),
        ).where(and_(*conditions))
    ).first()

    total_amount = result.total_amount or Decimal("0")
    total_quantity = result.total_quantity or 0
    row_count = result.row_count or 0

    # Calculate days in range
    days_in_range = (to_date - from_date).days + 1

    # Calculate averages
    avg_amount_per_day = total_amount / Decimal(str(days_in_range)) if days_in_range > 0 else Decimal("0")
    avg_amount_per_tx = total_amount / Decimal(str(row_count)) if row_count > 0 else None

    # Calculate max daily amount efficiently using window function
    # This is more efficient than fetching all daily sums
    daily_sums_subquery = (
        select(
            func.sum(FactSales.amount).label("daily_sum"),
        )
        .where(and_(*conditions))
        .group_by(FactSales.date)
        .subquery()
    )
    max_daily_result = db.execute(
        select(func.max(daily_sums_subquery.c.daily_sum))
    ).scalar()
    max_daily = max_daily_result

    return KPIsResponse(
        total_amount=total_amount,
        total_quantity=total_quantity,
        avg_amount_per_day=avg_amount_per_day,
        avg_amount_per_tx=avg_amount_per_tx,
        max_daily_amount=max_daily,
    )


@router.get("/timeseries", response_model=TimeSeriesResponse)
async def get_timeseries(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    grain: str = Query("month", description="Time grain: month, week, or day"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sub_category: Optional[str] = Query(None, description="Filter by sub-category"),
    sku: Optional[str] = Query(None, description="Filter by SKU"),
    db: Session = Depends(get_db),
):
    """Get time series data aggregated by time grain."""
    from_date, to_date = validate_date_range(date_from, date_to)

    if grain not in ["month", "week", "day"]:
        raise HTTPException(status_code=400, detail="grain must be 'month', 'week', or 'day'.")

    # Build filter conditions
    conditions = [
        FactSales.date >= from_date,
        FactSales.date <= to_date,
    ]
    if category:
        conditions.append(FactSales.category == category)
    if sub_category:
        conditions.append(FactSales.sub_category == sub_category)
    if sku:
        conditions.append(FactSales.sku == sku)

    # Group by time grain
    if grain == "month":
        bucket_expr = func.to_char(FactSales.date, "YYYY-MM")
        order_expr = func.to_char(FactSales.date, "YYYY-MM")
    elif grain == "week":
        # Use date_trunc for week, then format
        bucket_expr = func.to_char(func.date_trunc("week", FactSales.date), "YYYY-MM-DD")
        order_expr = func.date_trunc("week", FactSales.date)
    else:  # day
        bucket_expr = func.to_char(FactSales.date, "YYYY-MM-DD")
        order_expr = func.to_char(FactSales.date, "YYYY-MM-DD")

    result = (
        db.execute(
            select(
                bucket_expr.label("bucket"),
                func.sum(FactSales.amount).label("value"),
            )
            .where(and_(*conditions))
            .group_by(bucket_expr)
            .order_by(order_expr)
        )
        .all()
    )

    data = [TimeSeriesPoint(bucket=row.bucket, value=row.value or Decimal("0")) for row in result]

    return TimeSeriesResponse(data=data)


@router.get("/breakdown", response_model=BreakdownResponse)
async def get_breakdown(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    group_by: str = Query("category", description="Group by: category or sub_category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sub_category: Optional[str] = Query(None, description="Filter by sub-category"),
    sku: Optional[str] = Query(None, description="Filter by SKU"),
    db: Session = Depends(get_db),
):
    """Get breakdown data grouped by category or sub_category."""
    from_date, to_date = validate_date_range(date_from, date_to)

    if group_by not in ["category", "sub_category"]:
        raise HTTPException(status_code=400, detail="group_by must be 'category' or 'sub_category'.")

    # Build filter conditions
    conditions = [
        FactSales.date >= from_date,
        FactSales.date <= to_date,
    ]
    if category:
        conditions.append(FactSales.category == category)
    if sub_category:
        conditions.append(FactSales.sub_category == sub_category)
    if sku:
        conditions.append(FactSales.sku == sku)

    # Group by field
    if group_by == "category":
        group_expr = FactSales.category
    else:
        group_expr = FactSales.sub_category

    result = (
        db.execute(
            select(
                group_expr.label("label"),
                func.sum(FactSales.amount).label("value"),
            )
            .where(and_(*conditions))
            .group_by(group_expr)
            .order_by(func.sum(FactSales.amount).desc())
        )
        .all()
    )

    data = [BreakdownPoint(label=row.label, value=row.value or Decimal("0")) for row in result]

    return BreakdownResponse(data=data)


@router.get("/rows", response_model=TableResponse)
async def get_rows(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=1000, description="Number of rows to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    order_by: str = Query("date", description="Column to sort by"),
    order_dir: str = Query("desc", description="Sort direction: asc or desc"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sub_category: Optional[str] = Query(None, description="Filter by sub-category"),
    sku: Optional[str] = Query(None, description="Filter by SKU"),
    db: Session = Depends(get_db),
):
    """Get paginated table rows with sorting and filtering."""
    from_date, to_date = validate_date_range(date_from, date_to)

    if order_dir not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="order_dir must be 'asc' or 'desc'.")

    valid_columns = ["date", "category", "sub_category", "sku", "amount", "quantity"]
    if order_by not in valid_columns:
        raise HTTPException(
            status_code=400, detail=f"order_by must be one of: {', '.join(valid_columns)}."
        )

    # Build filter conditions
    conditions = [
        FactSales.date >= from_date,
        FactSales.date <= to_date,
    ]
    if category:
        conditions.append(FactSales.category == category)
    if sub_category:
        conditions.append(FactSales.sub_category == sub_category)

    # Build query
    query = select(FactSales).where(and_(*conditions))

    # Apply sorting
    order_column = getattr(FactSales, order_by)
    if order_dir == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())

    # Get total count (optimized: use same conditions without subquery)
    count_query = select(func.count(FactSales.id)).where(and_(*conditions))
    total = db.execute(count_query).scalar() or 0

    # Apply pagination
    query = query.limit(limit).offset(offset)

    # Execute query
    rows = db.execute(query).scalars().all()

    data = [
        TableRow(
            id=str(row.id),
            date=row.date,
            category=row.category,
            sub_category=row.sub_category,
            sku=row.sku,
            amount=row.amount,
            quantity=row.quantity,
        )
        for row in rows
    ]

    return TableResponse(data=data, total=total, limit=limit, offset=offset)

