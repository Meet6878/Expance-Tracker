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

CategorySchema.pre("findOneAndDelete", async function () {
  const category = await this.model.findOne(this.getFilter());

  if (category) {
    const Transaction = require("./Transaction");
    await Transaction.deleteMany({ category: category._id });
  }
});

module.exports = mongoose.model("Category", CategorySchema);
