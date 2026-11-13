
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  getClients,
  createClient,
  getStaffMembers,
  assignClient,
  getClientAssignments,
  removeClientAssignment
} = require("../controllers/clientController");

// ==========================================
// CLIENT LIST
// ==========================================

// Partners, staff, auditors and clients
router.get(
  "/clients",
  protect,
  getClients
);

// ==========================================
// PARTNER CLIENT MANAGEMENT
// ==========================================

// Create client
router.post(
  "/clients",
  protect,
  authorize("partner"),
  createClient
);

// List staff members
router.get(
  "/staff",
  protect,
  authorize("partner"),
  getStaffMembers
);

// Assign staff to client
router.post(
  "/clients/:id/assign",
  protect,
  authorize("partner"),
  assignClient
);

// View staff assigned to client
router.get(
  "/clients/:id/assignments",
  protect,
  authorize("partner"),
  getClientAssignments
);

// Remove staff assignment
router.delete(
  "/clients/:id/assign/:staffId",
  protect,
  authorize("partner"),
  removeClientAssignment
);

module.exports = router;
