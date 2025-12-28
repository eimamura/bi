"""Metadata endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct, select
from app.database import get_db
from app.models import FactSales
from app.logger import logger
from app.schemas import CategoryResponse, SubCategoryResponse, SKUResponse

router = APIRouter(prefix="/api/meta", tags=["metadata"])


@router.get("/categories", response_model=CategoryResponse)
async def get_categories(db: Session = Depends(get_db)):
    """Get list of all categories."""
    logger.info("Fetching categories")
    result = db.execute(select(distinct(FactSales.category)).order_by(FactSales.category))
    categories = [row[0] for row in result]
    logger.info(f"Found {len(categories)} categories")
    return CategoryResponse(categories=categories)


@router.get("/sub_categories", response_model=SubCategoryResponse)
async def get_sub_categories(
    category: str = Query(..., description="Category to get sub-categories for"),
    db: Session = Depends(get_db),
):
    """Get list of sub-categories for a given category."""
    logger.info(f"Fetching sub-categories for category: {category}")
    result = db.execute(
        select(distinct(FactSales.sub_category))
        .where(FactSales.category == category)
        .order_by(FactSales.sub_category)
    )
    sub_categories = [row[0] for row in result]
    logger.info(f"Found {len(sub_categories)} sub-categories for {category}")
    return SubCategoryResponse(sub_categories=sub_categories)


@router.get("/skus", response_model=SKUResponse)
async def get_skus(
    category: str = Query(None, description="Filter by category"),
    sub_category: str = Query(None, description="Filter by sub-category"),
    db: Session = Depends(get_db),
):
    """Get list of SKUs, optionally filtered by category and/or sub-category."""
    logger.info(f"Fetching SKUs for category: {category}, sub_category: {sub_category}")
    query = select(distinct(FactSales.sku)).order_by(FactSales.sku)
    
    if category:
        query = query.where(FactSales.category == category)
    if sub_category:
        query = query.where(FactSales.sub_category == sub_category)
    
    result = db.execute(query)
    skus = [row[0] for row in result]
    logger.info(f"Found {len(skus)} SKUs")
    return SKUResponse(skus=skus)

