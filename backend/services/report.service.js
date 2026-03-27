const Transaction = require("../models/Transaction");
const { getDateRange } = require("../utils/date.util");  // Make sure getDateRange is imported
const { generateCharts } = require("./chart.service");
const { generateTemplate } = require("../templates/report.template");
const { generatePDF } = require("./pdf.service");
const { sendEmail } = require("./email.service");

exports.generateUserReport = async (user, type) => {
  if (!user.isActive) return;
  if (!user.settings.emailNotifications) return;
  if (type === "monthly" && !user.settings.monthlyReminder) return;

  // Get the date range using the getDateRange function
  const { start, end } = getDateRange(type);

  // Log the date range for debugging (optional)
  // console.log("Report Date Range:", start, end);

  const monthStart = new Date(Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    1,
    0, 0, 0, 0
  ));

  

  // console.log("Month Range:", monthStart);

  // MongoDB aggregation pipeline
  const data = await Transaction.aggregate([
    {
      $match: {
        user: user._id,
      },
    },
    {
      $facet: {
        incomeData: [
          {
            $match: {
              type: "income",  // Filter for income transactions
              date: { $gte: monthStart, $lte: end }, // Monthly income
            },
          },
          {
            $group: {
              _id: null,
              totalIncome: { $sum: "$amount" },  // Sum the income for the given range
            },
          },
        ],
        expenseData: [
          {
            $match: {
              type: "expense",  // Filter for expense transactions
              date: { $gte: start, $lte: end }, // Last 7 days for expenses
            },
          },
          {
            $lookup: {
              from: "categories",   // Look up the category for each transaction
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },  // Unwind category array
          {
            $group: {
              _id: "$category.name",  // Group expenses by category name
              total: { $sum: "$amount" },
            },
          },
        ],
      },
    },
    {
      $project: {
        incomeData: { $arrayElemAt: ["$incomeData.totalIncome", 0] },  // Extract totalIncome from incomeData array
        expenseData: 1,  // Keep expenseData as is
      },
    },
  ]);

  // console.log("Aggregation Result:", JSON.stringify(data, null, 2));  // Log the aggregation result for debugging
  
  // Extract data from aggregation result
  const income = data[0]?.incomeData?.totalIncome || data[0]?.incomeData || 0;  // Total income for the given range
  // console.log("Total Income:", income);
  const expenseData = data[0]?.expenseData || [];  // Expense data for the last 7 days

  let expense = 0;
  const categoryMap = {};


  // Process the expense data and calculate total expense and categorize by name
  expenseData.forEach((item) => {
    expense += item.total;
    categoryMap[item._id] = item.total;  // Store expense total per category
  });

  // console.log("categoryMap", categoryMap);

  // Format categories for the report
  const categories = Object.entries(categoryMap).map(([name, amount]) => ({
    name,
    amount,
    percent: expense ? ((amount / expense) * 100).toFixed(1) : 0,  // Calculate percentage of total expense
  }));

  // Generate charts (pie and bar charts)
  const charts = await generateCharts(
    categories.map((c) => ({ _id: c.name, total: c.amount })),
    income,
    expense
  );

  // Generate HTML content for the report
  const html = generateTemplate({
    user,
    income,
    expense,
    savings: income - expense,  // Calculate savings (income - expense)
    charts,
    categories,
    type,
  });

  // Generate PDF from the HTML content
  const pdf = await generatePDF(html);

  // Send the report via email
  await sendEmail({
    to: user.email,
    subject: `${type.charAt(0).toUpperCase() + type.slice(1)} Expense Report`,
    text: "Your financial report is attached",
    attachments: [{ filename: "report.pdf", content: pdf }],
  });
};
