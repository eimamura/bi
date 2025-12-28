"""Seed script to populate fact_sales with sample data."""
import sys
import os
from datetime import date, timedelta
from decimal import Decimal
import random
import uuid

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import FactSales, Base

# Categories and sub-categories
CATEGORIES = {
    "Pumps": ["Centrifugal", "Diaphragm", "Gear", "Peristaltic"],
    "Valves": ["Ball", "Gate", "Butterfly", "Check"],
    "Filters": ["Cartridge", "Bag", "Membrane"],
    "Instruments": ["Pressure", "Temperature", "Flow"],
    "Fittings": ["Elbow", "Tee", "Reducer"],
}

# Base amounts per category (for realistic distribution)
BASE_AMOUNTS = {
    "Pumps": (500.0, 5000.0),
    "Valves": (100.0, 1000.0),
    "Filters": (50.0, 500.0),
    "Instruments": (200.0, 2000.0),
    "Fittings": (10.0, 100.0),
}


def generate_sales_data(start_date: date, days: int) -> list[FactSales]:
    """Generate sales data for the specified date range."""
    data = []
    end_date = start_date + timedelta(days=days - 1)
    current_date = start_date

    while current_date <= end_date:
        # Generate 5-20 transactions per day
        num_transactions = random.randint(5, 20)

        for _ in range(num_transactions):
            category = random.choice(list(CATEGORIES.keys()))
            sub_category = random.choice(CATEGORIES[category])

            # Amount varies by category
            min_amount, max_amount = BASE_AMOUNTS[category]
            amount = Decimal(str(random.uniform(min_amount, max_amount))).quantize(Decimal("0.01"))

            # Quantity: 1-10 units
            quantity = random.randint(1, 10)

            # Weekend effect: slightly fewer transactions
            if current_date.weekday() >= 5:  # Saturday or Sunday
                if random.random() > 0.3:  # 70% chance to skip
                    continue

            # Seasonal variation: more sales in middle months
            month = current_date.month
            if month in [3, 4, 5, 9, 10, 11]:  # Spring and Fall
                if random.random() < 0.2:  # 20% chance for extra transaction
                    num_transactions += 1

            data.append(
                FactSales(
                    id=uuid.uuid4(),
                    date=current_date,
                    category=category,
                    sub_category=sub_category,
                    amount=amount,
                    quantity=quantity,
                )
            )

        current_date += timedelta(days=1)

    return data


def seed_database():
    """Seed the database with sample data."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if data already exists
        existing_count = db.query(FactSales).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} records. Skipping seed.")
            return

        # Generate data for last 180 days
        end_date = date.today()
        start_date = end_date - timedelta(days=179)  # 180 days inclusive

        print(f"Generating sales data from {start_date} to {end_date}...")
        sales_data = generate_sales_data(start_date, 180)

        print(f"Inserting {len(sales_data)} records...")
        db.bulk_insert_mappings(FactSales, [row.__dict__ for row in sales_data])
        db.commit()

        print(f"Successfully seeded {len(sales_data)} records.")
        print(f"Categories: {list(CATEGORIES.keys())}")
        print(f"Date range: {start_date} to {end_date}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

