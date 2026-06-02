const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const { asyncHandler } = require("../middleware/errorHandler");

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { startDate, endDate } = req.query;

  // Base filter: user's transactions
  const baseMatch = { user: userId };

  // Add date filter if provided
  if (startDate || endDate) {
    baseMatch.date = {};
    if (startDate) baseMatch.date.$gte = new Date(startDate);
    if (endDate) {
      // Set to end of day so the entire endDate day is included
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      baseMatch.date.$lte = end;
    }
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const stats = await Transaction.aggregate([
    { $match: baseMatch },
    {
      $facet: {
        totalExpenses: [
          { $match: { type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        totalIncome: [
          { $match: { type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        expensesByCategory: [
          { $match: { type: "expense" } },
          { $group: { _id: "$category", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          { $project: { category: "$category.name", icon: "$category.icon", amount: 1, count: 1 } },
          { $sort: { amount: -1 } },
        ],
        incomeByCategory: [
          { $match: { type: "income" } },
          { $group: { _id: "$category", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          { $project: { category: "$category.name", icon: "$category.icon", amount: 1, count: 1 } },
          { $sort: { amount: -1 } },
        ],
        dailyTrend: [
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                type: "$type",
              },
              amount: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.date": 1 } },
        ],
        currentMonth: [
          { $match: { date: { $gte: currentMonthStart } } },
          { $group: { _id: "$type", total: { $sum: "$amount" } } },
        ],
        lastMonth: [
          { $match: { date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
          { $group: { _id: "$type", total: { $sum: "$amount" } } },
        ],
        recentTransactions: [
          { $sort: { date: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              description: 1,
              amount: 1,
              type: 1,
              date: 1,
              paymentMethod: 1,
              category: "$category.name",
            },
          },
        ],
      },
    },
  ]);

  const data = stats[0];
  const totalExpenses = data.totalExpenses[0]?.total || 0;
  const expenseCount = data.totalExpenses[0]?.count || 0;
  const totalIncome = data.totalIncome[0]?.total || 0;
  const incomeCount = data.totalIncome[0]?.count || 0;
  const avgExpense = expenseCount ? totalExpenses / expenseCount : 0;
  const totalSavings = totalIncome - totalExpenses;

  const formatMonthly = (items) => {
    const income = items.find((i) => i._id === "income")?.total || 0;
    const expense = items.find((i) => i._id === "expense")?.total || 0;
    return { income, expense, savings: income - expense };
  };

  const currentMonthData = formatMonthly(data.currentMonth);
  const lastMonthData = formatMonthly(data.lastMonth);

  // Format daily trend with both income and expense
  const trendMap = {};
  data.dailyTrend.forEach((d) => {
    if (!trendMap[d._id.date]) trendMap[d._id.date] = { date: d._id.date, income: 0, expense: 0 };
    trendMap[d._id.date][d._id.type] = d.amount;
  });
  const dailySpendingTrend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  const categoryBreakdown = data.expensesByCategory.map((item) => ({
    category: item.category || "Unknown",
    icon: item.icon || "",
    amount: item.amount,
    count: item.count,
  }));

  const incomeBreakdown = data.incomeByCategory.map((item) => ({
    category: item.category || "Unknown",
    icon: item.icon || "",
    amount: item.amount,
    count: item.count,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalExpenses,
      totalIncome,
      totalSavings,
      transactions: expenseCount + incomeCount,
      expenseCount,
      incomeCount,
      averageExpense: Number(avgExpense.toFixed(2)),
      categoryBreakdown,
      incomeBreakdown,
      dailySpendingTrend,
      monthlySavings: {
        current: currentMonthData,
        last: lastMonthData,
      },
      recentTransactions: data.recentTransactions,
    },
  });
});

module.exports = { getDashboardStats };
