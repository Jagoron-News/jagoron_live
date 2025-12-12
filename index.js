const express = require("express");
require("dotenv").config();
const cors = require("cors");

const { connectDB, getDB } = require("./db");
const urlRoute = require("./routes/url.js");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));

// Connect to PostgreSQL
connectDB()
    .then(() => console.log("PostgreSQL DB connected successfully"))
    .catch(err => {
        console.error("PostgreSQL connection error:", err);
        process.exit(1);
    });

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Root redirect
app.get('/', (req, res) => {
    res.redirect(301, 'https://jagoronnews.com');
});

// URL routes - must be registered before catch-all route
app.use("/url", urlRoute);

// Test route to verify Node.js is handling requests
app.get("/test", (req, res) => {
    res.json({ 
        message: "Node.js server is working!", 
        timestamp: new Date().toISOString(),
        path: req.path 
    });
});

// Handle redirection and record visit
app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;

    if (!shortId) {
        return res.status(400).send("Short ID is required");
    }

    let client;

    try {
        const pool = await getDB();
        client = await pool.connect();
        console.log(`Acquired PG connection for shortId: ${shortId}`);

        await client.query("BEGIN");

        const findUrlQuery = "SELECT id, redirecturl FROM urls WHERE shortid = $1";
        const result = await client.query(findUrlQuery, [shortId]);

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            console.log(`Short ID not found: ${shortId}`);
            return res.status(404).send("Short URL not found");
        }

        const urlData = result.rows[0];

        const insertVisitQuery =
            "INSERT INTO visit_history (url_id, visit_timestamp) VALUES ($1, NOW())";
        await client.query(insertVisitQuery, [urlData.id]);

        await client.query("COMMIT");

        console.log(`Redirecting ${shortId} to ${urlData.redirecturl}`);
        return res.redirect(urlData.redirecturl);

    } catch (error) {
        console.error("Error handling redirect:", error);
        if (client) await client.query("ROLLBACK");
        return res.status(500).send("Internal server error");
    } finally {
        if (client) client.release();
    }
});

app.listen(PORT, () => console.log(`Server started on Port: ${PORT}`));
