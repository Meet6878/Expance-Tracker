import Expense from '../models/Expense.js';

// Get all expenses with filtering
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, paymentMethod, search, page = 1, limit = 20 } = req.query;
    const userId = req.user.uid;

    const filter = { userId };

    // Apply filters
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

// Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      message: 'Failed to fetch expense',
      error: error.message,
    });
  }
};

// Create expense
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, paymentMethod, date, description, tags, notes, isRecurring, recurringFrequency } = req.body;
    const userId = req.user.uid;

    // Validation
    if (!title || !amount || !category || !paymentMethod || !date) {
      return res.status(400).json({
        message: 'Missing required fields: title, amount, category, paymentMethod, date',
      });
    }

    const expense = await Expense.create({
      userId,
      title,
      amount,
      category,
      paymentMethod,
      date: new Date(date),
      description: description || '',
      tags: tags || [],
      notes: notes || '',
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      message: 'Failed to create expense',
      error: error.message,
    });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updateData = req.body;

    // Prevent userId modification
    delete updateData.userId;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      message: 'Failed to update expense',
      error: error.message,
    });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: expense,
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      message: 'Failed to delete expense',
      error: error.message,
    });
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'category' } = req.query;
    const userId = req.user.uid;

    const matchStage = { userId };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date.$lte = end;
      }
    }

    let groupStage = {};
    if (groupBy === 'category') {
      groupStage = {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      };
    } else if (groupBy === 'paymentMethod') {
      groupStage = {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      };
    } else if (groupBy === 'date') {
      groupStage = {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      };
    }

    const stats = await Expense.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalExpense = await Expense.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        total: totalExpense[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};

// Get monthly expense summary
export const getMonthlySummary = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user.uid;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const summary = await Expense.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({
      message: 'Failed to fetch monthly summary',
      error: error.message,
    });
  }
};
