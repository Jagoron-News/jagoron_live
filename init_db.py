#!/usr/bin/env python3
"""
Database initialization script for URL shortener service.
Run this script to create the necessary database tables.
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """Initialize the database by creating required tables."""
    try:
        # Read schema file
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', '127.0.0.1'),
            port=int(os.getenv('POSTGRES_PORT', '5432')),
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            database=os.getenv('POSTGRES_DB', 'short_url_db')
        )
        
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Execute schema SQL
        print("Creating database tables...")
        cursor.execute(schema_sql)
        
        print("✓ Database tables created successfully!")
        print("✓ Tables: urls, visit_history")
        print("✓ Indexes created for optimal performance")
        
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Error: schema.sql file not found at {schema_path}")
        sys.exit(1)
    except psycopg2.OperationalError as e:
        print(f"Error connecting to database: {e}")
        print("\nPlease check your .env file and ensure:")
        print("1. PostgreSQL is running")
        print("2. Database exists (or create it manually)")
        print("3. Connection credentials are correct")
        sys.exit(1)
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == '__main__':
    init_database()

