import mongoose from "mongoose";

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

export default mongoose.model("Transaction", transactionSchema);
