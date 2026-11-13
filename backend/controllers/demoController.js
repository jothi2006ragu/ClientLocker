
const mongoose = require("mongoose");
const Person = require("../models/Person");
const Firm = require("../models/Firm");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const { hashPassword } = require("../utils/password");

const createDemoAccount = async (req, res) => {
  try {
    // Demo account creation is development-only.
    if (
      process.env.NODE_ENV === "production" ||
      process.env.DEMO_LOGIN_ENABLED !== "true"
    ) {
      return res.status(403).json({
        success: false,
        message: "Demo account creation is disabled."
      });
    }

    const { name, email, password, role } = req.body;

    const allowedRoles = ["partner", "staff", "client", "auditor"];

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required."
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role."
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid account details. Password must be 12–72 bytes."
      });
    }

    const firm = await Firm.findOne({
      name: "Vaigai Vel & Associates"
    });

    if (!firm) {
      return res.status(404).json({
        success: false,
        message: "Firm not found."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Person.findOne({
      firm_id: firm._id,
      email: normalizedEmail
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    let clientId = null;

    if (role === "client") {
      const { clientId: requestedClientId } = req.body;

      if (!mongoose.isValidObjectId(requestedClientId)) {
        return res.status(400).json({
          success: false,
          message: "A valid clientId is required for a client account."
        });
      }

      const client = await Client.findOne({
        _id: requestedClientId,
        firm_id: firm._id
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found in this firm."
        });
      }

      clientId = client._id;
    }

    const passwordHash = await hashPassword(password);

    const person = await Person.create({
      firm_id: firm._id,
      name: name.trim(),
      email: normalizedEmail,
      role,
      client_id: clientId,
      password_hash: passwordHash,
      auth_provider: "local",
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: "Demo account created successfully.",
      user: {
        id: person._id,
        name: person.name,
        email: person.email,
        role: person.role,
        client_id: person.client_id
      }
    });
  } catch (error) {
    console.error("Demo account creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create demo account."
    });
  }
};

module.exports = { createDemoAccount };
