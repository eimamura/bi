"""Database models."""
from sqlalchemy import Column, String, Date, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class FactSales(Base):
    """Fact table for sales data."""
    __tablename__ = "fact_sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(Date, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    sub_category = Column(String, nullable=False, index=True)
    sku = Column(String, nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)

