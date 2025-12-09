const express = require("express");
const { handleGeneratedNewShortUrl, handleGetAnalytics } = require("../controllers/url.js");
const{ handleGetAnalyticsAllLikes, } = require("../controllers/allDataControllers.js")

const router = express.Router();

router.post('/', handleGeneratedNewShortUrl);
router.get('/allData', handleGetAnalyticsAllLikes);
router.get('/analytics/:shortId', handleGetAnalytics);



module.exports = router;