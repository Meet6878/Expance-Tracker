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
  },
  { timestamps: true },
);
CategorySchema.index({  createdAt: -1 });
module.exports = mongoose.model("Category", CategorySchema);
