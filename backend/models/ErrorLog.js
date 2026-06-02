const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema(
  {
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    message: { type: String },
    level: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "error",
    },
    responseTime: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: { type: String },
    stack: { type: String },
  },
  { timestamps: true },
);

errorLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ErrorLog", errorLogSchema);
