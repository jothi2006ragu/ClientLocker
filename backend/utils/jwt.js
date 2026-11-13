
const jwt = require("jsonwebtoken");

const generateToken = (person) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  if (!person || !person._id || !person.role) {
    throw new Error("Valid user information is required to generate a token.");
  }

  return jwt.sign(
    {
      personId: person._id.toString(),
      role: person.role,
      firmId: person.firm_id.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: "clientlocker",
      audience: "clientlocker-users"
    }
  );
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "clientlocker",
    audience: "clientlocker-users"
  });
};

module.exports = {
  generateToken,
  verifyToken
};
