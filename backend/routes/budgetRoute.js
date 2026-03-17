const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getBuedgetByCategory,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../contollers/budgetController");

const app = express();

const budgetRouter = express.Router();

budgetRouter.get("/category/:categoryId", protect, getBuedgetByCategory);

// Create budget
budgetRouter.post("/create", protect, createBudget);

// Update budget
budgetRouter.put("/update/:id", protect, updateBudget);

// Delete budget
budgetRouter.delete("/delete/:id", protect, deleteBudget);

module.exports = budgetRouter;
