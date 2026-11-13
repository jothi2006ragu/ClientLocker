const express = require("express");
const router = express.Router();

const { login, testLogin } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  requestMagicLink
} = require("../controllers/magicLinkController");
const {
  verifyMagicLink
} = require("../controllers/magicLinkVerifyController");

const {
  googleLogin
} = require("../controllers/googleAuthController");
// Email and password login
router.post("/login", login);
router.post("/google", googleLogin);
// Development-only test login
router.post("/test-login", testLogin);

// Client magic-link login
router.post("/magic-link/request", requestMagicLink);
router.post("/magic-link/verify", verifyMagicLink);

// Protected endpoint: get currently logged-in user
router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated user retrieved successfully.",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      firm_id: req.user.firm_id,
      client_id: req.user.client_id,
      is_active: req.user.is_active
    }
  });
});

module.exports = router;