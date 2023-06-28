import mongoose from "mongoose";
const Schema = mongoose.Schema;
const salesPersonSchema = new Schema({
    email: { type: String, required: true },
    isAdmin: { type: Boolean, required: false, default: false },
    status: { type: String, required: true, default: "INACTIVE" },
    password: { type: String, required: true, minlength: 6 },
    transactions: [
        { type: mongoose.Types.ObjectId, required: true, ref: "Transaction" },
    ],
});
export const SalesPerson = mongoose.model("SalesPerson", salesPersonSchema);
