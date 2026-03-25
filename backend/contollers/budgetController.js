const Budget = require("../models/Budget");
const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandler");

const getBuedgetByCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { categoryId } = req.params;
  const budget = await Budget.findOne({
    user: userId,
    category: categoryId,
  }).populate("category", "name");
  
  if (!budget) {
    const err = new Error("Budget not found for this category");
    err.status = 404;
    throw err;
  }
  
  res.status(200).json({
    success: true,
    message: "Budget retrieved successfully",
    data: budget,
  });
});

const createBudget = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { category, limit } = req.body;

  if (!category || !limit) {
    const err = new Error("Category and limit are required");
    err.status = 400;
    throw err;
  }
  
  if (limit <= 0) {
    const err = new Error("Limit must be a positive number");
    err.status = 400;
    throw err;
  }
  
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  const existingBudget = await Budget.findOne({ user: userId, category });
  if (existingBudget) {
    const err = new Error("Budget for this category already exists");
    err.status = 400;
    throw err;
  }

  const newBudget = new Budget({
    user: userId,
    category,
    limit,
  });
  await newBudget.save();

  res.status(201).json({
    success: true,
    message: "Budget created successfully",
    data: newBudget,
  });
});

const updateBudget = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { limit } = req.body;

  const budget = await Budget.findOneAndUpdate(
    { _id: id, user: userId },
    { limit },
    { new: true, runValidators: true },
  );

  if (!budget) {
    const err = new Error("Budget not found");
    err.status = 404;
    throw err;
  }

  res.status(200).json({
    success: true,
    message: "Budget updated successfully",
    data: budget,
  });
});

const deleteBudget = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const budget = await Budget.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!budget) {
    const err = new Error("Budget not found");
    err.status = 404;
    throw err;
  }

  res.status(200).json({
    success: true,
    message: "Budget deleted successfully",
  });
});

module.exports = {
  getBuedgetByCategory,
  createBudget,
  updateBudget,
  deleteBudget,
};
