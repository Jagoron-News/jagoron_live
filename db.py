import psycopg2
from psycopg2 import pool
import os
from dotenv import load_dotenv

load_dotenv()

connection_pool = None

def connect_db():
    global connection_pool
    if connection_pool:
        return connection_pool
    
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=os.getenv('POSTGRES_HOST', '127.0.0.1'),
            port=int(os.getenv('POSTGRES_PORT', '5432')),
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            database=os.getenv('POSTGRES_DB', 'short_url_db')
        )
        
        # Test connection
        conn = connection_pool.getconn()
        print("PostgreSQL connected successfully")
        connection_pool.putconn(conn)
        return connection_pool
        
    except Exception as error:
        print(f"PostgreSQL connection error: {error}")
        raise

def get_db():
    if not connection_pool:
        connect_db()
    return connection_pool

