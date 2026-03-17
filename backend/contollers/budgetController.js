const Budget = require("../models/Budget");
const Category = require("../models/Category");

const getBuedgetByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log("User ID from request:", req.user);
    const { categoryId } = req.params;
    const budget = await Budget.findOne({
      user: userId,
      category: categoryId,
    }).populate("category", "name");
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found for this category",
      });
    }
    res.status(200).json({
      success: true,
      message: "Budget retrieved successfully",
      data: budget,
    });
  } catch (error) {
    console.error("Get budget error:", error);
    res.status(500).json({
      message: "Failed to get budget",
      error: error.message,
    });
  }
};

const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limit } = req.body;

    if (!category || !limit) {
      return res
        .status(400)
        .send({ success: false, message: "Category and limit are required" });
    }
    if (limit <= 0) {
      return res
        .status(400)
        .send({ success: false, message: "Limit must be a positive number" });
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existingBudget = await Budget.findOne({ user: userId, category });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget for this category already exists",
        data: existingBudget,
      });
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
  } catch (error) {
    console.error("Create budget error:", error);
    res.status(500).json({
      message: "Failed to create budget",
      error: error.message,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { limit } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, user: userId },
      { limit },
      { new: true, runValidators: true },
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);
    res.status(500).json({
      message: "Failed to update budget",
      error: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({
      message: "Failed to delete budget",
      error: error.message,
    });
  }
};

module.exports = {
  getBuedgetByCategory,
  createBudget,
  updateBudget,
  deleteBudget,
};
