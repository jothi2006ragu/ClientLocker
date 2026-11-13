
const crypto = require("crypto");
const Person = require("../models/Person");
const MagicLink = require("../models/MagicLink");
const { sendMagicLinkEmail } = require("../services/emailService");

// REQUEST MAGIC LINK
const requestMagicLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Only active client accounts can use magic-link login.
    const person = await Person.findOne({
      email: normalizedEmail,
      role: "client",
      is_active: true
    });

    // Avoid revealing whether an account exists.
    const genericResponse = {
      success: true,
      message:
        "If an active client account exists for this email, a login link will be sent."
    };

    if (!person) {
      return res.status(200).json(genericResponse);
    }

    // Generate a cryptographically secure random token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash.
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate previous unused links for this client.
    await MagicLink.updateMany(
      {
        person_id: person._id,
        used_at: null
      },
      {
        $set: {
          used_at: new Date()
        }
      }
    );

    await MagicLink.create({
      person_id: person._id,
      token_hash: tokenHash,
      expires_at: expiresAt
    });

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is missing.");
    }

    const magicLink =
      `${frontendUrl}/client/magic-login?token=${rawToken}`;

    try {
      await sendMagicLinkEmail(
        person.email,
        magicLink
      );
    } catch (emailError) {
      // Invalidate the token if email delivery fails.
      await MagicLink.updateOne(
        { token_hash: tokenHash },
        { $set: { used_at: new Date() } }
      );

      throw emailError;
    }

    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error("Magic link request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send login link. Please try again."
    });
  }
};

module.exports = {
  requestMagicLink
};
