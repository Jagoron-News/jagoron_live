const { getDB } = require("../db.js");

const handleGetAnalyticsAllLikes = async (req, res) => {
    try {
        const pool = await getDB(); // this should be a pg Pool

        console.log("Getting all URLs");

        const findAllUrlsQuery = `
            SELECT id, shortid, redirecturl, createdat, updatedat
            FROM urls
            ORDER BY createdat DESC
        `;

        // Use pool.query directly, no need to call .connect()
        const result = await pool.query(findAllUrlsQuery);

        res.status(200).send({
            Success: true,
            message: 'Fetched all URL data',
            data: result.rows
        });

    } catch (err) {
        console.error("Error in /alldata:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    handleGetAnalyticsAllLikes,
};
module.exports = {
    handleGetAnalyticsAllLikes,
};
