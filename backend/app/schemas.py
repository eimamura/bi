"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import Optional, List
from decimal import Decimal


class HealthResponse(BaseModel):
    """Health check response."""
    status: str


class CategoryResponse(BaseModel):
    """Category metadata response."""
    categories: List[str]


class SubCategoryResponse(BaseModel):
    """Sub-category metadata response."""
    sub_categories: List[str]


class SKUResponse(BaseModel):
    """SKU metadata response."""
    skus: List[str]


class KPIsResponse(BaseModel):
    """KPI metrics response."""
    total_amount: Decimal
    total_quantity: int
    avg_amount_per_day: Decimal
    avg_amount_per_tx: Optional[Decimal] = None
    max_daily_amount: Optional[Decimal] = None


class TimeSeriesPoint(BaseModel):
    """Time series data point."""
    bucket: str
    value: Decimal


class TimeSeriesResponse(BaseModel):
    """Time series response."""
    data: List[TimeSeriesPoint]


class BreakdownPoint(BaseModel):
    """Breakdown data point."""
    label: str
    value: Decimal


class BreakdownResponse(BaseModel):
    """Breakdown response."""
    data: List[BreakdownPoint]


class TableRow(BaseModel):
    """Table row data."""
    id: str
    date: date
    category: str
    sub_category: str
    sku: str
    amount: Decimal
    quantity: int


class TableResponse(BaseModel):
    """Table response with pagination."""
    data: List[TableRow]
    total: int
    limit: int
    offset: int

