-- Database schema for URL shortener service

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    shortid VARCHAR(255) UNIQUE NOT NULL,
    redirecturl TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create visit_history table
CREATE TABLE IF NOT EXISTS visit_history (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    visit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on shortid for faster lookups
CREATE INDEX IF NOT EXISTS idx_urls_shortid ON urls(shortid);

-- Create index on url_id for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_visit_history_url_id ON visit_history(url_id);

-- Create index on visit_timestamp for faster sorting
CREATE INDEX IF NOT EXISTS idx_visit_history_timestamp ON visit_history(visit_timestamp DESC);

