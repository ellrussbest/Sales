const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const returnSchema = new Schema({
  transactionId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Transaction",
  },
  productId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Transaction",
  },
});

module.exports = mongoose.model("Return", returnSchema);
