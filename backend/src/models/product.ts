import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  company: { type: String, required: true },
  categoryId: {
    type: mongoose.Types.ObjectId,
    required: false,
    ref: "Category",
  },
});

export const Product = mongoose.model("Product", productSchema);
