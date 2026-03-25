const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const { asyncHandler } = require("../middleware/errorHandler");

const getTransection = asyncHandler(async (req, res) => {
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
});

const createTransaction = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { description, category, type, paymentMethod, amount, date } = req.body;

  if (!description || !category || !type || !amount) {
    const err = new Error("Please provide all required fields");
    err.status = 400;
    throw err;
  }

  const categoryExits = await Category.findById(category);
  if (!categoryExits) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  const parsedDate = date ? new Date(date) : new Date().toString();

  if (date && isNaN(parsedDate)) {
    const err = new Error("Invalid date format");
    err.status = 400;
    throw err;
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
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { category, type, ...otherData } = req.body;

  if (category || type) {
    const cat = await Category.findById(category || req.body.category);

    if (!cat || cat.type !== (type || req.body.type)) {
      const err = new Error("Invalid category for this type");
      err.status = 400;
      throw err;
    }
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { ...otherData, category, type },
    { new: true },
  ).populate("category", "name icon");

  if (!transaction) {
    const err = new Error("Transaction not found");
    err.status = 404;
    throw err;
  }

  res.json(transaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction) {
    const err = new Error("Transaction not found");
    err.status = 404;
    throw err;
  }

  res.json({ message: "Deleted" });
});

module.exports = {
  getTransection,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
