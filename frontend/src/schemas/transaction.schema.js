import { z } from "zod";

export const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
  paymentMethod: z.enum(["cash", "card", "upi", "bank_transfer", "wallet"], {
    required_error: "Payment method is required",
  }),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().optional(),
});
