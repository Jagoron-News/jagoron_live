const { Pool } = require("pg");
require("dotenv").config();

let pool;

async function connectDB() {
    if (pool) return pool;
    try {
        pool = new Pool({
            host: process.env.POSTGRES_HOST || "127.0.0.1",
            port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
            user: process.env.POSTGRES_USER || "postgres",
            password: process.env.POSTGRES_PASSWORD || "",
            // database: process.env.POSTGRES_DB || "short_url_db",
            max: 10,
            idleTimeoutMillis: 30000,
        });

        const client = await pool.connect();
        console.log("PostgreSQL connected successfully");
        client.release();
        return pool;

    } catch (error) {
        console.error("PostgreSQL connection error:", error);
        process.exit(1);
    }
}

async function getDB() {
    if (!pool) await connectDB();
    return pool;
}

module.exports = { connectDB, getDB };
