import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    plan: {
        type: String,
        enum: ["pro", "enterprise"],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
        required: true
    }
}, {
    timestamps: true
})

transactionSchema.index({userId:1,createdAt:-1})

const Transaction = mongoose.model("Transaction", transactionSchema)

export default Transaction
