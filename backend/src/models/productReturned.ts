import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  returnId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Return",
  },
  reasonForReturn: { type: String, required: true },
});

export default mongoose.model("ProductReturned", productSchema);
