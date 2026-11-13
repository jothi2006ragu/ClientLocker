
const mongoose = require("mongoose");

const clientAccessSchema = new mongoose.Schema(
  {
    person_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: [true, "Staff person ID is required"]
    },

    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client ID is required"]
    },

    given_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: [true, "Partner ID is required"]
    }
  },
  {
    collection: "client_access",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// A staff member should have only one active access
// record for a particular client.
clientAccessSchema.index(
  { person_id: 1, client_id: 1 },
  { unique: true }
);

// Find all clients assigned to a person efficiently.
clientAccessSchema.index({ person_id: 1 });

// Find all people assigned to a particular client.
clientAccessSchema.index({ client_id: 1 });

const ClientAccess = mongoose.model(
  "ClientAccess",
  clientAccessSchema
);

module.exports = ClientAccess;
