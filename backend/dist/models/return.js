import mongoose from "mongoose";
const Schema = mongoose.Schema;
const returnSchema = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product",
    },
    reasonForReturn: { type: String, required: true },
    transactionId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Transaction",
    },
});
export const Return = mongoose.model("Return", returnSchema);
