const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  discount: { type: Number, required: false, default: 0 },
  reasonForDiscount: { type: String, required: false, default: "" },
  company: { type: String, required: true },
  categoryId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  transactionId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Transaction",
  },
  returns: [{ type: mongoose.Types.ObjectId, required: true, ref: "Return" }],
});

module.exports = mongoose.model("Product", productSchema);
