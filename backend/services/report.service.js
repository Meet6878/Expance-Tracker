const Transaction = require("../models/Transaction");
const { getDateRange } = require("../utils/date.util");
const { generateCharts } = require("./chart.service");
const { generateTemplate } = require("../templates/report.template");
const { generatePDF } = require("./pdf.service");
const { sendEmail } = require("./email.service");

exports.generateUserReport = async (user, type) => {
  if (!user.settings.emailNotifications) return;
  if (type === "monthly" && !user.settings.monthlyReminder) return;

  const { start, end } = getDateRange(type);

  const data = await Transaction.aggregate([
    {
      $match: {
        user: user._id,
        type: "expense",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: {
          type: "$type",
          category: "$category.name",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  let income = 0;
  let expense = 0;
  const categoryMap = {};

  data.forEach((item) => {
    if (item._id.type === "income") {
      income += item.total;
      return;
    }

    // Only expense categories are included in the category table/chart
    expense += item.total;
    if (!categoryMap[item._id.category]) {
      categoryMap[item._id.category] = 0;
    }
    categoryMap[item._id.category] += item.total;
  });

  const categories = Object.entries(categoryMap).map(([name, amount]) => ({
    name,
    amount,
    percent: expense ? ((amount / expense) * 100).toFixed(1) : 0,
  }));

  const charts = await generateCharts(
    categories.map((c) => ({ _id: c.name, total: c.amount })),
    income,
    expense,
  );

  const html = generateTemplate({
    user,
    income,
    expense,
    savings: income - expense,
    charts,
    categories,
    type,
  });

  const pdf = await generatePDF(html);

  await sendEmail({
    to: user.email,
    subject: `${type.charAt(0).toUpperCase() + type.slice(1)} Expense Report`,
    text: "Your financial report is attached",
    attachments: [{ filename: "report.pdf", content: pdf }],
  });
};
