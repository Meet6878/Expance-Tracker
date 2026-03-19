const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const stats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          /* ------------------------- TOTAL EXPENSES ------------------------- */ totalExpenses:
            [
              { $match: { type: "expense" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
            ],
          /* ------------------------- TOTAL INCOME ------------------------- */ totalIncome:
            [
              { $match: { type: "income" } },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ],
          /* ------------------------- EXPENSES BY CATEGORY ------------------------- */ expensesByCategory:
            [
              { $match: { type: "expense" } },
              { $group: { _id: "$category", amount: { $sum: "$amount" } } },
              {
                $lookup: {
                  from: "categories",
                  localField: "_id",
                  foreignField: "_id",
                  as: "category",
                },
              },
              {
                $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: true,
                },
              },
              { $project: { category: "$category.name", amount: 1 } },
            ],
          /* ------------------------- DAILY TREND ------------------------- */ dailyTrend:
            [
              { $match: { type: "expense" } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  amount: { $sum: "$amount" },
                },
              },
              { $sort: { _id: 1 } },
            ],
          /* ------------------------- CURRENT MONTH SAVINGS ------------------------- */ currentMonth:
            [
              { $match: { date: { $gte: currentMonthStart } } },
              { $group: { _id: "$type", total: { $sum: "$amount" } } },
            ],
          /* ------------------------- LAST MONTH SAVINGS ------------------------- */ lastMonth:
            [
              {
                $match: { date: { $gte: lastMonthStart, $lte: lastMonthEnd } },
              },
              { $group: { _id: "$type", total: { $sum: "$amount" } } },
            ],
        },
      },
    ]);
    const data = stats[0];
    const totalExpenses = data.totalExpenses[0]?.total || 0;
    const expenseCount = data.totalExpenses[0]?.count || 0;
    const totalIncome = data.totalIncome[0]?.total || 0;
    const avgExpense = expenseCount ? totalExpenses / expenseCount : 0;
    const totalSavings = totalIncome - totalExpenses;
    const formatMonthly = (items) => {
      const income = items.find((i) => i._id === "income")?.total || 0;
      const expense = items.find((i) => i._id === "expense")?.total || 0;
      return income - expense;
    };
    const currentMonthSavings = formatMonthly(data.currentMonth);
    const lastMonthSavings = formatMonthly(data.lastMonth);
    const dailySpendingTrend = data.dailyTrend.map((d) => ({
      date: d._id,
      amount: d.amount,
    }));
    const categoryBreakdown = data.expensesByCategory.map((item) => ({
      category: item.category || "Unknown",
      amount: item.amount,
    }));
    res
      .status(200)
      .json({
        success: true,
        data: {
          totalExpenses,
          transactions: expenseCount,
          averageExpense: Number(avgExpense.toFixed(2)),
          totalIncome,
          totalSavings,
          expensesByCategory: data.expensesByCategory,
          categoryBreakdown,
          dailySpendingTrend,
          monthlySavings: {
            current: currentMonthSavings,
            last: lastMonthSavings,
          },
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to load dashboard stats",
        error: error.message,
      });
  }
};
module.exports = { getDashboardStats };
