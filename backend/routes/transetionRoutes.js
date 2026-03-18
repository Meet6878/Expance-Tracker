const express = require("express");
const { getTransection, createTransaction } = require("../contollers/transectionController");
const { protect } = require("../middleware/auth");



const transectionRouter = express.Router();
transectionRouter.use(protect);
transectionRouter.get("/", getTransection);
transectionRouter.post("/create", createTransaction);


module.exports = transectionRouter;
