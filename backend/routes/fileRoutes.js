
const express = require("express");
const router = express.Router();

// ==========================================
// MIDDLEWARE
// ==========================================

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  requireClientAccess
} = require("../middleware/clientAccessMiddleware");

const upload = require("../middleware/upload");

// ==========================================
// CONTROLLERS
// ==========================================

const {
  uploadFile,
  getClientFiles
} = require("../controllers/fileController");

const {
  createDownloadLink,
  downloadFile
} = require("../controllers/downloadController");

// ==========================================
// TASK 3: LIST CLIENT FILES
// ==========================================

router.get(
  "/clients/:clientId/files",
  protect,
  requireClientAccess,
  getClientFiles
);

// ==========================================
// TASK 3: UPLOAD CLIENT FILES
// ==========================================

router.post(
  "/clients/:clientId/files",
  protect,
  authorize("partner", "staff"),
  requireClientAccess,
  upload.single("file"),
  upload.validateFileSignature,
  uploadFile
);

// ==========================================
// TASK 6: CREATE SECURE DOWNLOAD LINK
// ==========================================

// POST /api/files/:id/link
//
// Requires:
// 1. Valid JWT authentication.
// 2. Existing file.
// 3. Current access to the client's files.
//
// Generates a secure link valid for 10 minutes.

router.post(
  "/files/:id/link",
  protect,
  createDownloadLink
);

// ==========================================
// TASK 6: DOWNLOAD FILE
// ==========================================

// GET /api/links/:token
//
// Requires:
// 1. Valid JWT authentication.
// 2. Valid download token.
// 3. Link has not expired.
// 4. User still has access to the client.
//
// Streams the file through Express.
// Never exposes the Cloudinary URL.

router.get(
  "/links/:token",
  protect,
  downloadFile
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
