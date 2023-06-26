const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const salesPersonSchema = new Schema({
  name: { type: String, required: true },
  isAdmin: { type: Boolean, required: false, default: false },
  transactions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Transaction" },
  ],
});

module.exports = mongoose.model("SalesPerson", salesPersonSchema);
