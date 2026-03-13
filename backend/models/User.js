const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },
    profileImage: {
      type: String,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      monthlyReminder: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
