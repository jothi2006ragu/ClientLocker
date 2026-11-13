
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password must not exceed 72 bytes.");
  }

  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, passwordHash) {
  if (
    typeof password !== "string" ||
    typeof passwordHash !== "string" ||
    !passwordHash
  ) {
    return false;
  }

  return await bcrypt.compare(password, passwordHash);
}

module.exports = {
  hashPassword,
  comparePassword
};
