import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi", "bank_transfer", "wallet"]
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"]
  },
  currency: {
    type: String,
    default: "INR"
  }
},
{
  timestamps: true
});

// Compound indexes for optimized filtering and aggregation

expenseSchema.index({  category: 1 });
expenseSchema.index({  createdAt: -1 });
expenseSchema.index({ date: -1 });

// Text index for search functionality
expenseSchema.index({ title: "text", description: "text" });

export default mongoose.model("Expense", expenseSchema);
