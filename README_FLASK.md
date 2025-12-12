# Jagoron Live - Flask Version

This is the Flask version of the URL shortener service.

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the PostgreSQL connection details in `.env`

3. **Initialize the database:**
   ```bash
   python init_db.py
   ```
   This will create the necessary tables (`urls` and `visit_history`) in your PostgreSQL database.

4. **Run the Flask application:**
   ```bash
   python app.py
   ```

   Or using Flask CLI:
   ```bash
   flask run
   ```

## Project Structure

```
.
├── app.py                      # Main Flask application
├── db.py                       # Database connection module
├── init_db.py                  # Database initialization script
├── schema.sql                  # Database schema SQL file
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── routes/
│   ├── __init__.py
│   └── url.py                 # URL routes blueprint
└── controllers/
    ├── __init__.py
    ├── url.py                 # URL controller functions
    └── allDataControllers.py  # All data controller functions
```

## API Endpoints

- `POST /url/` - Create a new short URL
- `GET /url/allData` - Get all URLs data
- `GET /url/analytics/<short_id>` - Get analytics for a specific short URL
- `GET /<short_id>` - Redirect to the original URL

## Database

The application uses PostgreSQL. The database schema is defined in `schema.sql` and can be initialized using `init_db.py`.

### Database Tables

- **urls** table:
  - `id` (SERIAL PRIMARY KEY)
  - `shortid` (VARCHAR, UNIQUE)
  - `redirecturl` (TEXT)
  - `createdat` (TIMESTAMP)
  - `updatedat` (TIMESTAMP)

- **visit_history** table:
  - `id` (SERIAL PRIMARY KEY)
  - `url_id` (INTEGER, FOREIGN KEY to urls.id)
  - `visit_timestamp` (TIMESTAMP)

### Manual Database Setup

If you prefer to set up the database manually:

1. Create the database:
   ```sql
   CREATE DATABASE short_url_db;
   ```

2. Run the schema file:
   ```bash
   psql -U postgres -d short_url_db -f schema.sql
   ```

