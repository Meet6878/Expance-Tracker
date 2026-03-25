exports.generateTemplate = ({
  user,
  income,
  expense,
  savings,
  charts,
  categories,
  type = "Report",
}) => {
  return `
  <html>
  <head>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f4f6f8;
        margin: 0;
        padding: 20px;
        color: #333;
      }

      .container {
        max-width: 900px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }

      .header {
        background: linear-gradient(135deg, #4CAF50, #2e7d32);
        color: white;
        padding: 25px;
        text-align: center;
      }

      .header h1 {
        margin: 0;
        font-size: 26px;
      }

      .header p {
        margin-top: 5px;
        opacity: 0.9;
      }

      .content {
        padding: 25px;
      }

      .greeting {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .cards {
        display: flex;
        justify-content: space-between;
        margin-bottom: 25px;
      }

      .card {
        flex: 1;
        margin: 5px;
        padding: 20px;
        border-radius: 10px;
        color: #fff;
        text-align: center;
      }

      .card h3 {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .card p {
        font-size: 22px;
        font-weight: bold;
        margin: 10px 0 0;
      }

      .income { background: #4CAF50; }
      .expense { background: #f44336; }
      .saving { background: #2196F3; }

      .section {
        margin-top: 30px;
      }

      .section h2 {
        font-size: 18px;
        margin-bottom: 10px;
        border-left: 4px solid #4CAF50;
        padding-left: 10px;
      }

      .chart {
        text-align: center;
        margin-top: 10px;
      }

      .chart img {
        width: 100%;
        max-width: 600px;
        border-radius: 8px;
      }

      .footer {
        text-align: center;
        font-size: 12px;
        color: #777;
        padding: 20px;
        border-top: 1px solid #eee;
      }

      .footer .credit {
        margin-top: 8px;
        font-size: 13px;
        color: #4CAF50;
        font-weight: bold;
      }

      .category-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 14px;
        }

        .category-table th {
        background: #4CAF50;
        color: white;
        padding: 10px;
        text-align: left;
        }

        .category-table td {
        padding: 10px;
        border-bottom: 1px solid #eee;
        }

        .category-table tr:nth-child(even) {
        background: #f9f9f9;
        }

        /* Progress Bar */
        .progress-bar {
        background: #eee;
        height: 6px;
        border-radius: 5px;
        margin-top: 5px;
        overflow: hidden;
        }

        .progress {
        height: 100%;
        background: #4CAF50;
        }

    .section {
        margin-top: 30px;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }

      .highlight {
        color: #4CAF50;
        font-weight: bold;
      }

    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <h1>💰 ${type.toUpperCase()} FINANCIAL REPORT</h1>
        <p>Your personal finance summary</p>
      </div>
      <p style="margin-top:8px; font-size:13px; opacity:0.9;">
        Period: ${new Date().toLocaleDateString()}
      </p>

      <div class="content">

        <p class="greeting">
          Hello <b>${user.name}</b>, 👋 <br/>
          Here's your financial summary for this period.
        </p>

        <div class="cards">
          <div class="card income">
            <h3>Total Income</h3>
            <p>₹${income}</p>
          </div>

          <div class="card expense">
            <h3>Total Expense</h3>
            <p>₹${expense}</p>
          </div>

          <div class="card saving">
            <h3>Net Savings</h3>
            <p>
                ₹${savings} ${savings > 0 ? "📈" : "📉"}
                </p>
          </div>
        </div>

       

        <div class="section">
        <h2>🧾 Category Breakdown</h2>

        <div class="chart">
            <img src="${charts.pie}" />
        </div>

        <table class="category-table">
            <thead>
            <tr>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Usage</th>
            </tr>
            </thead>

            <tbody>
            ${
              categories?.filter((c) => c.amount > 0).length
                ? categories
                    .filter((c) => c.amount > 0)
                    .map(
                      (c) => `
                <tr>
                <td>${c.name}</td>
                <td>₹${c.amount}</td>
                <td>
                    ${c.percent}%
                    <div class="progress-bar">
                    <div class="progress" style="width:${c.percent}%"></div>
                    </div>
                </td>
                </tr>
            `,
                    )
                    .join("")
                : `<tr><td colspan="3">No data available</td></tr>`
            }
            </tbody>
        </table>
        </div>

        <div class="section">
          <h2>📈 Income vs Expense</h2>
          <div class="chart">
            <img src="${charts.bar}" />
          </div>
        </div>

      </div>

      <div class="footer">
        <p>
          This report was generated automatically by your Finance Tracker system.
        </p>
       <p>
            ${
              savings > 0
                ? `Excellent! You saved <span class="highlight">₹${savings}</span>. Keep it up 🚀`
                : `You overspent by <span class="highlight">₹${Math.abs(
                    savings,
                  )}</span>. Try budgeting smarter 💡`
            }
            </p>
        <p class="credit">
          Created by MR Sathvara
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
};
