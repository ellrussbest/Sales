const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  salesPersonId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "SalesPerson",
  },
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
  returns: [{ type: mongoose.Types.ObjectId, required: true, ref: "Return" }],
});

module.exports = mongoose.model("Transaction", transactionSchema);
