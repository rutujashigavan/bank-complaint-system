const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  // Link complaint to logged-in user using email + customerId
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  // Existing fields
  name: String,
  email: String,
  customerId: String,
  mobile: String,

  category: String,
  priority: { type: String, default: "Low" },

  fields: Object,

  status: {
    type: String,
    default: "Submitted"
  },

  time: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);