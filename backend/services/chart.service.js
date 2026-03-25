const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const chart = new ChartJSNodeCanvas({ width: 600, height: 400 });

exports.generateCharts = async (categories, income, expense) => {
  const pie = await chart.renderToDataURL({
    type: "pie",
    data: {
      labels: categories.map((c) => c._id),
      datasets: [{ data: categories.map((c) => c.total) }],
    },
  });

  const bar = await chart.renderToDataURL({
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [income, expense] }],
    },
  });

  return { pie, bar };
};