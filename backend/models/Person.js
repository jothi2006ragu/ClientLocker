
const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
  {
    firm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: true
    },

    name: {
      type: String,
      required: [true, "Person name is required"],
      trim: true,
      maxlength: 120
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true
    },

    role: {
      type: String,
      enum: ["partner", "staff", "client", "auditor"],
      required: true
    },

    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null
    },

    login_id: {
      type: String,
      default: null
    },

    password_hash: {
      type: String,
      default: null,
      select: false
    },

    google_id: {
      type: String,
      default: null
    },

    auth_provider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local"
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: "people",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

// Prevent duplicate email accounts within the same firm.
personSchema.index(
  { firm_id: 1, email: 1 },
  { unique: true }
);

// Prevent one Google account from being linked to multiple people.
personSchema.index(
  { google_id: 1 },
  {
    unique: true,
    partialFilterExpression: {
      google_id: { $type: "string" }
    }
  }
);

// Validate client account relationships.
personSchema.pre("validate", function () {
  if (this.role === "client" && !this.client_id) {
    throw new Error("Client accounts must have a client_id.");
  }

  if (this.role !== "client" && this.client_id) {
    throw new Error("Only client accounts can have a client_id.");
  }
});

const Person = mongoose.model("Person", personSchema);

module.exports = Person;
