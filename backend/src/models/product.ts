import mongoose from "mongoose";

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
});

export default mongoose.model("Product", productSchema);
