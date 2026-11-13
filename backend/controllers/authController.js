
const Person = require("../models/Person");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

// Remove sensitive information before returning account details.
const formatUser = (person) => ({
  id: person._id,
  name: person.name,
  email: person.email,
  role: person.role,
  firm_id: person.firm_id,
  client_id: person.client_id,
  is_active: person.is_active
});

// EMAIL AND PASSWORD LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const person = await Person.findOne({
      email: email.trim().toLowerCase(),
      is_active: true
    }).select("+password_hash");

    if (
      !person ||
      !person.password_hash ||
      !(await comparePassword(password, person.password_hash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateToken(person);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(person)
    });
  } catch (error) {
    console.error("Email login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete login."
    });
  }
};

// DEVELOPMENT-ONLY TEST LOGIN
const testLogin = async (req, res) => {
  try {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.DEMO_LOGIN_ENABLED !== "true"
    ) {
      return res.status(403).json({
        success: false,
        message: "Test login is disabled."
      });
    }

    const { role, email } = req.body;

    const allowedRoles = ["partner", "staff", "client", "auditor"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid demo role."
      });
    }

    const query = {
      role,
      is_active: true
    };

    if (email && typeof email === "string") {
      query.email = email.trim().toLowerCase();
    }

    const person = await Person.findOne(query).sort({ created_at: 1 });

    if (!person) {
      return res.status(404).json({
        success: false,
        message: `No active demo account found for role: ${role}.`
      });
    }

    const token = generateToken(person);

    return res.status(200).json({
      success: true,
      message: "Demo login successful.",
      token,
      user: formatUser(person)
    });
  } catch (error) {
    console.error("Test login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete test login."
    });
  }
};

module.exports = {
  login,
  testLogin
};
