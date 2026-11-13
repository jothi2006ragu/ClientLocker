
const crypto = require("crypto");
const Person = require("../models/Person");
const MagicLink = require("../models/MagicLink");
const { generateToken } = require("../utils/jwt");

const verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired login link."
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Atomically consume the token.
    // Only one simultaneous request can successfully use it.
    const magicLink = await MagicLink.findOneAndUpdate(
      {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { $gt: new Date() }
      },
      {
        $set: { used_at: new Date() }
      },
      { new: true }
    );

    if (!magicLink) {
      return res.status(400).json({
        success: false,
        message: "Invalid, expired, or already used login link."
      });
    }

    const person = await Person.findOne({
      _id: magicLink.person_id,
      role: "client",
      is_active: true
    });

    if (!person) {
      return res.status(403).json({
        success: false,
        message: "Client account is inactive or unavailable."
      });
    }

    const jwtToken = generateToken(person);

    return res.status(200).json({
      success: true,
      message: "Client login successful.",
      token: jwtToken,
      user: {
        id: person._id,
        name: person.name,
        email: person.email,
        role: person.role,
        firm_id: person.firm_id,
        client_id: person.client_id,
        is_active: person.is_active
      }
    });

  } catch (error) {
    console.error("Magic link verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify login link."
    });
  }
};

module.exports = { verifyMagicLink };
