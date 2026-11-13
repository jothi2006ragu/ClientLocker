
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  getActivityLogs
} = require("../controllers/activityController");

// Only Partners can view activity logs.
router.get(
  "/activity",
  protect,
  authorize("partner"),
  getActivityLogs
);

module.exports = router;
