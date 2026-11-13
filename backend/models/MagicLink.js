
const mongoose = require("mongoose");

const magicLinkSchema = new mongoose.Schema(
  {
    person_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
      index: true
    },

    token_hash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },

    expires_at: {
      type: Date,
      required: true
    },

    used_at: {
      type: Date,
      default: null
    }
  },
  {
    collection: "magic_links",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// Automatically clean up expired records.
// Actual expiry will ALSO be checked by the verification API.
magicLinkSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);

const MagicLink = mongoose.model("MagicLink", magicLinkSchema);

module.exports = MagicLink;
