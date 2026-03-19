const express = require("express");

const { protect } = require("../middleware/auth");
const { getDashboardStats } = require("../contollers/dashBoardData");

const dashboardRouter = express.Router();
dashboardRouter.use(protect);
dashboardRouter.get("/", getDashboardStats);

module.exports = dashboardRouter;
