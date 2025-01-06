const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const AnalyticsController = require("../controllers/analyticsController");

// Analytics routes
router.get("/stand/:standId", authenticate, AnalyticsController.getStandAnalytics);
router.get("/user/:userId", authenticate, AnalyticsController.getUserAnalytics);

module.exports = router;
