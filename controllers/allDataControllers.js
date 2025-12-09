const { getDB } = require("../db.js");

const handleGetAnalyticsAllLikes = async (req, res) => {
    let connection;
    try {
        const pool = await getDB();
        connection = await pool.getConnection();
        console.log("Acquired connection for getting all URLs");

        // Fetch all URLs data
        const findAllUrlsQuery = 'SELECT id, shortId, redirectURL, createdAt, updatedAt FROM urls ORDER BY createdAt DESC';
        const [urlRows] = await connection.execute(findAllUrlsQuery);

        res.status(200).send({ Success: true, message: 'Fetched all URL data', data: urlRows });

    } catch (err) {
        console.error("Error in /alldata:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            console.log("Releasing connection after getting all URLs");
            connection.release();
        }
    }
}

module.exports = {
    handleGetAnalyticsAllLikes,
}

