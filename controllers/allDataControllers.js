const { getDB } = require("../db.js");

const handleGetAnalyticsAllLikes = async (req, res) => {
    let client;
    try {
        const pool = await getDB();
        client = await pool.connect();  // <-- PostgreSQL connect()

        console.log("Acquired connection for getting all URLs");

        const findAllUrlsQuery = `
            SELECT id, shortid, redirecturl, createdat, updatedat
            FROM urls
            ORDER BY createdat DESC
        `;

        const result = await client.query(findAllUrlsQuery);

        res.status(200).send({
            Success: true,
            message: 'Fetched all URL data',
            data: result.rows
        });

    } catch (err) {
        console.error("Error in /alldata:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (client) {
            console.log("Releasing PostgreSQL connection");
            client.release();  // <-- PostgreSQL release()
        }
    }
};

module.exports = {
    handleGetAnalyticsAllLikes,
};
