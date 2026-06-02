const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getAllBudgets,
  getBuedgetByCategory,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../contollers/budgetController");

const budgetRouter = express.Router();

budgetRouter.get("/", protect, getAllBudgets);
budgetRouter.get("/category/:categoryId", protect, getBuedgetByCategory);

// Create budget
budgetRouter.post("/create", protect, createBudget);

// Update budget
budgetRouter.put("/update/:id", protect, updateBudget);

// Delete budget
budgetRouter.delete("/delete/:id", protect, deleteBudget);

module.exports = budgetRouter;
