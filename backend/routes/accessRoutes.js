
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  giveClientAccess,
  removeClientAccess,
  getClientAccess
} = require("../controllers/accessController");

// All access-management routes require partner authentication.

router.post(
  "/access",
  protect,
  authorize("partner"),
  giveClientAccess
);

router.delete(
  "/access/:id",
  protect,
  authorize("partner"),
  removeClientAccess
);

router.get(
  "/access/client/:clientId",
  protect,
  authorize("partner"),
  getClientAccess
);

module.exports = router;
