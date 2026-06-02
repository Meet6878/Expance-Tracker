import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().optional(),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
});
