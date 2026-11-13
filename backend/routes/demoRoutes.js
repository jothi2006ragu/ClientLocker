
const express = require("express");

const router = express.Router();

const {
  createDemoAccount
} = require("../controllers/demoController");

// Create a demo account
router.post("/create-account", createDemoAccount);

// Export Express router directly
module.exports = router;
