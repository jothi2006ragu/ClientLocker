const mongoose = require("mongoose");

const firmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    collection: "firms",
    versionKey: false
  }
);

module.exports = mongoose.model("Firm", firmSchema);