const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const getTransection = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { user: userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", "name");

    const total = await Transaction.countDocuments(filter);
    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("Add transection error:", error);
    res.status(500).json({
      message: "Failed to add transection",
      error: error.message,
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { description, category, type, paymentMethod, amount, date } =
      req.body;
    if (!description || !category || !type || !amount) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }
    const categoryExits = await Category.findById(category);
    if (!categoryExits) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    const parsedDate = date ? new Date(date) : new Date().toString();

    if (date && isNaN(parsedDate)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }
    const transaction = new Transaction({
      user: userId,
      description,
      category,
      type,
      paymentMethod,
      amount,
      date: parsedDate,
    });
    await transaction.save();
    res.status(201).json({
      success: true,
      message: "Transection created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Add transection error:", error);
    res.status(500).json({
      message: "Failed to add transection",
      error: error.message,
    });
  }
};

const updateTransaction = async (req, res) => {
  const { category, type, ...otherData } = req.body;

  if (category || type) {
    const cat = await Category.findById(category || req.body.category);

    if (!cat || cat.type !== (type || req.body.type)) {
      return res
        .status(400)
        .json({ message: "Invalid category for this type" });
    }
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { ...otherData, category, type },
    { new: true },
  ).populate("category", "name icon");

  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });

  res.json(transaction);
};

const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });

  res.json({ message: "Deleted" });
};

module.exports = {
  getTransection,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
