const cron = require("node-cron");
const User = require("../models/User");

const { processInBatches } = require("../utils/batch.util");
const { generateUserReport } = require("../services/report.service");
const logger = require("../config/logger");

// Weekly
cron.schedule("0 8 * * 0", () => run("weekly"));

// Monthly
cron.schedule("0 8 1 * *", () => run("monthly"));

// cron.schedule("*/1 * * * *", () => run("monthly"));

const run = async (type) => {
  logger.info(`${type} job started`);

  await processInBatches(User, 50, async (user) => {
    await generateUserReport(user, type);
  });

  logger.info(`${type} job completed`);
};
