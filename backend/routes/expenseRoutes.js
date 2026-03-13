import express from "express";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getMonthlySummary,
} from "../controllers/expenseController.js";
import { jwtAuthMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// All routes require authentication
router.use(jwtAuthMiddleware);

// Expense CRUD operations
router.get("/", asyncHandler(getExpenses));
router.post("/", asyncHandler(createExpense));
router.get("/:id", asyncHandler(getExpenseById));
router.put("/:id", asyncHandler(updateExpense));
router.delete("/:id", asyncHandler(deleteExpense));

// Statistics and analytics
router.get("/stats/summary", asyncHandler(getExpenseStats));
router.get("/stats/monthly", asyncHandler(getMonthlySummary));

export default router;
