const shortid = require("shortid");
const { getDB } = require("../db.js");

async function handleGeneratedNewShortUrl(req, res) {
    const body = req?.body;
    if (!body?.url) return res.status(400).json({ error: 'url is required' });

    const shortID = shortid.generate();
    const redirectURL = body.url;
    let connection;

    try {
        const pool = await getDB();
        connection = await pool.getConnection();
        console.log("Acquired connection for inserting URL");

        const insertQuery = 'INSERT INTO urls (shortId, redirectURL) VALUES (?, ?)';
        const [result] = await connection.execute(insertQuery, [shortID, redirectURL]);

        console.log("Inserted URL with ID:", result.insertId);
        return res.status(201).json({ message: "Short URL created!", id: shortID });

    } catch (error) {
        console.error("Error saving URL:", error);
        // Check for duplicate entry error (e.g., ER_DUP_ENTRY for MySQL)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Short ID already exists. Please try again.' });
        }
        return res.status(500).json({ error: 'Failed to create short URL' });
    } finally {
        if (connection) {
            console.log("Releasing connection after inserting URL");
            connection.release();
        }
    }
}

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    if (!shortId) return res.status(400).json({ error: 'Short ID is required' });

    let connection;

    try {
        const pool = await getDB();
        connection = await pool.getConnection();
        console.log("Acquired connection for getting analytics");

        // Find the URL first
        const findUrlQuery = 'SELECT id, shortId, redirectURL, createdAt, updatedAt FROM urls WHERE shortId = ?';
        const [urlRows] = await connection.execute(findUrlQuery, [shortId]);

        if (urlRows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const urlData = urlRows[0];

        // Get visit history
        const findHistoryQuery = 'SELECT visit_timestamp FROM visit_history WHERE url_id = ? ORDER BY visit_timestamp DESC';
        const [historyRows] = await connection.execute(findHistoryQuery, [urlData.id]);

        const analytics = historyRows.map(row => ({ timestamp: row.visit_timestamp })); 

        return res.json({
            ShortID: urlData.shortId,
            realUrlLink: urlData.redirectURL,
            CreateUrlTime: urlData.createdAt,
            UpdateUrlTime: urlData.updatedAt,
            totalClicks: historyRows.length,
            analytics: analytics,
        });

    } catch (error) {
        console.error("Error getting analytics:", error);
        return res.status(500).json({ error: 'Failed to retrieve analytics' });
    } finally {
        if (connection) {
            console.log("Releasing connection after getting analytics");
            connection.release();
        }
    }
}

module.exports = {
    handleGeneratedNewShortUrl,
    handleGetAnalytics,
};

