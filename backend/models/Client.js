
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    firm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: [true, "Firm ID is required"]
    },

    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: 150
    }
  },
  {
    collection: "clients",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// Prevent duplicate client names within the same firm.
clientSchema.index(
  { firm_id: 1, name: 1 },
  { unique: true }
);

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
