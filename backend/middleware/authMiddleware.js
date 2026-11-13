
const Person = require("../models/Person");
const { verifyToken } = require("../utils/jwt");

/**
 * Verify JWT and load the authenticated account.
 */
const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing."
      });
    }

    const decoded = verifyToken(token);

    const person = await Person.findOne({
      _id: decoded.personId,
      firm_id: decoded.firmId,
      is_active: true
    }).select("-password_hash");

    if (!person) {
      return res.status(401).json({
        success: false,
        message: "Account not found or deactivated."
      });
    }

    if (person.role !== decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is no longer valid."
      });
    }

    req.user = person;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token."
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication verification failed."
    });
  }
};

/**
 * Restrict access to specified roles.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource."
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
