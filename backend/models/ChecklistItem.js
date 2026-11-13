
const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client ID is required"]
    },

    name: {
      type: String,
      required: [true, "Checklist item name is required"],
      trim: true,
      maxlength: 200
    },

    done: {
      type: Boolean,
      default: false
    }
  },
  {
    collection: "checklist_items",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// Prevent duplicate checklist items for the same client.
checklistItemSchema.index(
  { client_id: 1, name: 1 },
  { unique: true }
);

// Quickly retrieve all checklist items for a client.
checklistItemSchema.index({ client_id: 1 });

const ChecklistItem = mongoose.model(
  "ChecklistItem",
  checklistItemSchema
);

module.exports = ChecklistItem;
