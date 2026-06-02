const express = require("express");
const { getLogs } = require("../contollers/logController");
const { protect, getRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getRole, getLogs);

module.exports = router;
