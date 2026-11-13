
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client ID is required"]
    },

    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: [true, "Uploader ID is required"]
    },

    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      maxlength: 255
    },

    // Cloudinary public_id, not a local file path.
    storage_path: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      trim: true
    },

    // Cloudinary asset identifier.
    cloudinary_asset_id: {
      type: String,
      default: null
    },

    // Cloudinary resource type: image or raw.
    cloudinary_resource_type: {
      type: String,
      enum: ["image", "raw"],
      required: true
    },

    file_type: {
      type: String,
      enum: ["PDF", "JPG", "PNG"],
      required: true
    },

    file_size: {
      type: Number,
      required: true,
      min: 1,
      max: 4 * 1024 * 1024
    },

    checklist_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChecklistItem",
      default: null
    }
  },
  {
    collection: "files",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// Quickly find files belonging to a client.
fileSchema.index({ client_id: 1, created_at: -1 });

// Quickly find files uploaded by a person.
fileSchema.index({ uploaded_by: 1 });

const StoredFile = mongoose.model("StoredFile", fileSchema);

module.exports = StoredFile;
