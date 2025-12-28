"""Add SKU column to fact_sales

Revision ID: 003
Revises: 002
Create Date: 2024-01-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add SKU column
    op.add_column('fact_sales', sa.Column('sku', sa.String(), nullable=True))
    
    # Create index for SKU
    op.create_index('ix_fact_sales_sku', 'fact_sales', ['sku'])
    
    # Update existing records with SKU using a subquery approach
    # PostgreSQL doesn't allow window functions directly in UPDATE, so we use a CTE
    op.execute("""
        WITH numbered_rows AS (
            SELECT 
                id,
                category || '-' || sub_category || '-' || LPAD((ROW_NUMBER() OVER (PARTITION BY category, sub_category ORDER BY id)::text), 3, '0') as new_sku
            FROM fact_sales
        )
        UPDATE fact_sales
        SET sku = numbered_rows.new_sku
        FROM numbered_rows
        WHERE fact_sales.id = numbered_rows.id
    """)
    
    # Make SKU NOT NULL after populating
    op.alter_column('fact_sales', 'sku', nullable=False)


def downgrade() -> None:
    op.drop_index('ix_fact_sales_sku', table_name='fact_sales')
    op.drop_column('fact_sales', 'sku')

