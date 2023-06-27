import mongoose from "mongoose";

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: Boolean, required: true },
});

export const Supplier = mongoose.model("Supplier", supplierSchema);
