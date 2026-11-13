
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  getClientChecklist,
  updateChecklistItem
} = require("../controllers/checklistController");

// ==========================================
// GET CLIENT CHECKLIST
// Partner, staff, client and auditor
// ==========================================

router.get(
  "/clients/:clientId/checklist",
  protect,
  authorize("partner", "staff", "client", "auditor"),
  getClientChecklist
);

// ==========================================
// UPDATE CHECKLIST ITEM
// Partner and staff only
// ==========================================

router.patch(
  "/checklist/:id",
  protect,
  authorize("partner", "staff"),
  updateChecklistItem
);

module.exports = router;
