const ErrorLog = require("../models/ErrorLog");


const getLogs = async (req, res) => {
  const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: logs });
};

module.exports = { getLogs };
