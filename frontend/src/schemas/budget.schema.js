import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.coerce.number().positive("Budget limit must be positive"),
});
