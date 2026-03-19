const express = require("express");
const {
  getTransection,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../contollers/transectionController");
const { protect } = require("../middleware/auth");

const transectionRouter = express.Router();
transectionRouter.use(protect);
transectionRouter.get("/", getTransection);
transectionRouter.post("/create", createTransaction);
transectionRouter.put("/update/:id",  updateTransaction);
transectionRouter.delete("/delete/:id", deleteTransaction);

module.exports = transectionRouter;
