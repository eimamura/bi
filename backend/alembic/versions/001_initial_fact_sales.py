"""Initial fact_sales table

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'fact_sales',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('sub_category', sa.String(), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
    )
    
    # Create indexes
    op.create_index('ix_fact_sales_date', 'fact_sales', ['date'])
    op.create_index('ix_fact_sales_category', 'fact_sales', ['category'])
    op.create_index('ix_fact_sales_sub_category', 'fact_sales', ['sub_category'])
    op.create_index('idx_date_category', 'fact_sales', ['date', 'category'])
    op.create_index('idx_category_subcategory', 'fact_sales', ['category', 'sub_category'])


def downgrade() -> None:
    op.drop_index('idx_category_subcategory', table_name='fact_sales')
    op.drop_index('idx_date_category', table_name='fact_sales')
    op.drop_index('ix_fact_sales_sub_category', table_name='fact_sales')
    op.drop_index('ix_fact_sales_category', table_name='fact_sales')
    op.drop_index('ix_fact_sales_date', table_name='fact_sales')
    op.drop_table('fact_sales')

