import mongoose from "mongoose";
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    name: { type: String, required: true },
    products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
});
export const Category = mongoose.model("Category", categorySchema);
