
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    person_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: [true, "Person ID is required"]
    },

    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null
    },

    file_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoredFile",
      default: null
    },

    action: {
      type: String,
      required: [true, "Activity action is required"],
      trim: true,
      enum: [
        "FILE_UPLOADED",
        "FILE_OPENED",
        "ACCESS_GRANTED",
        "ACCESS_REMOVED",
        "ACCESS_BLOCKED",
        "FILE_DOWNLOAD_BLOCKED"
      ]
    },

    blocked: {
      type: Boolean,
      default: false
    }
  },
  {
    collection: "activity_log",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// ==========================================
// INDEXES
// ==========================================

// Retrieve recent activity first.
activityLogSchema.index({ created_at: -1 });

// Retrieve activity for a particular person.
activityLogSchema.index({
  person_id: 1,
  created_at: -1
});

// Retrieve activity for a particular file.
activityLogSchema.index({ file_id: 1 });

// Retrieve activity for a particular client.
activityLogSchema.index({
  client_id: 1,
  created_at: -1
});

// Retrieve blocked activity.
activityLogSchema.index({
  blocked: 1,
  created_at: -1
});

const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);

module.exports = ActivityLog;
