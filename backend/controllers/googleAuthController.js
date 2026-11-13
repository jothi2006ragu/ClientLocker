
const { OAuth2Client } = require("google-auth-library");

const Person = require("../models/Person");
const { generateToken } = require("../utils/jwt");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// GOOGLE LOGIN
// POST /api/auth/google
// ==========================================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (
      !credential ||
      typeof credential !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Google authentication credential is required."
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is not configured.");

      return res.status(500).json({
        success: false,
        message: "Google login is not configured."
      });
    }

    // Verify the Google ID token.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account email could not be verified."
      });
    }

    const email = payload.email.trim().toLowerCase();
    const googleId = payload.sub;

    // Find accounts matching this email.
    // Do not guess which firm account should receive access.
    const matchingPeople = await Person.find({
      email
    }).select(
      "_id name email role firm_id client_id is_active google_id"
    );

    if (matchingPeople.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No ClientLocker account is registered with this Google email. Please contact your partner."
      });
    }

    // The same email may exist in multiple firms.
    // Require an unambiguous account match.
    if (matchingPeople.length > 1) {
      return res.status(409).json({
        success: false,
        message: "This email is registered with multiple firms. Please contact your partner to resolve your account."
      });
    }

    const person = matchingPeople[0];

    if (!person.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your ClientLocker account is inactive. Please contact your partner."
      });
    }

    // Ensure the Google account is not linked to another person.
    const linkedGoogleAccount = await Person.findOne({
      google_id: googleId
    }).select("_id");

    if (
      linkedGoogleAccount &&
      linkedGoogleAccount._id.toString() !== person._id.toString()
    ) {
      return res.status(409).json({
        success: false,
        message: "This Google account is already linked to another ClientLocker account."
      });
    }

    // Do not allow an existing account to be silently
    // linked to a different Google identity.
    if (person.google_id && person.google_id !== googleId) {
      return res.status(409).json({
        success: false,
        message: "A different Google account is already linked to this ClientLocker account."
      });
    }

    // Client accounts must have a valid client association.
    if (
      person.role === "client" &&
      !person.client_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Your client account is not properly configured."
      });
    }

    // Link the verified Google account if not already linked.
    if (!person.google_id) {
      person.google_id = googleId;
      await person.save();
    }

    // Generate the normal ClientLocker JWT.
    const token = generateToken(person);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token,
      user: {
        id: person._id.toString(),
        name: person.name,
        email: person.email,
        role: person.role,
        firm_id: person.firm_id,
        client_id: person.client_id,
        is_active: person.is_active
      }
    });

  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed. Please try again."
    });
  }
};

module.exports = {
  googleLogin
};
