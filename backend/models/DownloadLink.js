
const mongoose = require("mongoose");

const downloadLinkSchema = new mongoose.Schema(
  {
    // Store only the SHA-256 hash, never the raw token.
    token_hash: {
      type: String,
      required: [true, "Download token hash is required"],
      unique: true,
      select: false
    },

    file_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoredFile",
      required: [true, "File ID is required"]
    },

    person_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: [true, "Person ID is required"]
    },

    expires_at: {
      type: Date,
      required: [true, "Expiry date is required"]
    }
  },
  {
    collection: "download_links",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

downloadLinkSchema.index({ person_id: 1 });
downloadLinkSchema.index({ file_id: 1 });
downloadLinkSchema.index({ expires_at: 1 });

const DownloadLink = mongoose.model(
  "DownloadLink",
  downloadLinkSchema
);

module.exports = DownloadLink;
