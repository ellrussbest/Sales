import mongoose from "mongoose";
const Schema = mongoose.Schema;
const productSchema = new Schema({
    name: { type: String, required: true },
    discount: { type: Number, required: false, default: 0 },
    reasonForDiscount: { type: String, required: false, default: "" },
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
