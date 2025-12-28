"""Optimize indexes for performance

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add composite index for date range queries with category/sub_category filters
    # This covers the most common query pattern: date range + category filter
    op.create_index(
        'idx_date_category_subcategory',
        'fact_sales',
        ['date', 'category', 'sub_category'],
        postgresql_using='btree'
    )
    
    # Add index for amount column (used in aggregations and sorting)
    op.create_index(
        'idx_amount',
        'fact_sales',
        ['amount'],
        postgresql_using='btree'
    )


def downgrade() -> None:
    op.drop_index('idx_amount', table_name='fact_sales')
    op.drop_index('idx_date_category_subcategory', table_name='fact_sales')

