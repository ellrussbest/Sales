import mongoose from "mongoose";

const Schema = mongoose.Schema;

const salesPersonSchema = new Schema({
  name: { type: String, required: true },
  isAdmin: { type: Boolean, required: false, default: false },
  transactions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Transaction" },
  ],
});

export const SalesPerson = mongoose.model("SalesPerson", salesPersonSchema);
