const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    icon: {
      type: String,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
  },
  { timestamps: true },
);
CategorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", CategorySchema);
