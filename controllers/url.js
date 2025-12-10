const shortid = require("shortid");
const { getDB } = require("../db.js");

// Create new short URL
async function handleGeneratedNewShortUrl(req, res) {
    const body = req?.body;
    if (!body?.url) return res.status(400).json({ error: 'url is required' });

    const shortID = shortid.generate();
    const redirectURL = body.url;
    let client;

    try {
        const pool = await getDB();
        client = await pool.connect();
        console.log("Acquired PG connection for inserting URL");

        const insertQuery = `
            INSERT INTO urls (shortId, redirectURL)
            VALUES ($1, $2)
            RETURNING id
        `;
        const result = await client.query(insertQuery, [shortID, redirectURL]);

        console.log("Inserted URL with ID:", result.rows[0].id);
        return res.status(201).json({ message: "Short URL created!", id: shortID });

    } catch (error) {
        console.error("Error saving URL:", error);
        // Handle duplicate shortId
        if (error.code === '23505') { // PostgreSQL unique violation
            return res.status(409).json({ error: 'Short ID already exists. Please try again.' });
        }
        return res.status(500).json({ error: 'Failed to create short URL' });
    } finally {
        if (client) {
            client.release();
            console.log("Released PG connection after inserting URL");
        }
    }
}

// Get analytics for a short URL
async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    if (!shortId) return res.status(400).json({ error: 'Short ID is required' });

    let client;

    try {
        const pool = await getDB();
        client = await pool.connect();
        console.log("Acquired PG connection for analytics");

        // Find the URL first
        const findUrlQuery = `
            SELECT id, shortId, redirectURL, createdAt, updatedAt
            FROM urls
            WHERE shortId = $1
        `;
        const urlResult = await client.query(findUrlQuery, [shortId]);

        if (urlResult.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const urlData = urlResult.rows[0];

        // Get visit history
        const findHistoryQuery = `
            SELECT visit_timestamp
            FROM visit_history
            WHERE url_id = $1
            ORDER BY visit_timestamp DESC
        `;
        const historyResult = await client.query(findHistoryQuery, [urlData.id]);

        const analytics = historyResult.rows.map(row => ({ timestamp: row.visit_timestamp }));

        return res.json({
            ShortID: urlData.shortid,
            realUrlLink: urlData.redirecturl,
            CreateUrlTime: urlData.createdat,
            UpdateUrlTime: urlData.updatedat,
            totalClicks: historyResult.rows.length,
            analytics: analytics,
        });

    } catch (error) {
        console.error("Error getting analytics:", error);
        return res.status(500).json({ error: 'Failed to retrieve analytics' });
    } finally {
        if (client) {
            client.release();
            console.log("Released PG connection after getting analytics");
        }
    }
}

module.exports = {
    handleGeneratedNewShortUrl,
    handleGetAnalytics,
};
