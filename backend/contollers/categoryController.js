const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandler");

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.status(200).send({
    success: true,
    message: "Categories fetched successfully",
    categories,
  });
});

// Get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  res.status(200).send({
    success: true,
    message: "Category fetched successfully",
    category,
  });
});

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, type } = req.body;
  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    const err = new Error("Category with this name already exists");
    err.status = 400;
    throw err;
  }

  const newCategory = await Category.create({ name, icon, type });
  res.status(201).send({
    success: true,
    message: "Category created successfully",
    category: newCategory,
  });
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, icon, type } = req.body;
  const category = await Category.findById(id);

  if (!category) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  // Check if new name conflicts with another category
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      const err = new Error("Category with this name already exists");
      err.status = 400;
      throw err;
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name, ...req.body },
    { new: true, runValidators: true },
  );

  res.status(200).send({
    success: true,
    message: "Category updated successfully",
    category: updatedCategory,
  });
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  await Category.findByIdAndDelete(id);
  res.status(200).send({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
