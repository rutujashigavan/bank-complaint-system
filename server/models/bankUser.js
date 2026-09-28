const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  customerId: String
});

module.exports = mongoose.model("BankUser", bankUserSchema);