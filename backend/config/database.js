const mongoose = require("mongoose");

const DBconn = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("data base connected successfully");
  } catch (error) {
    console.log("error", error);
    process.exit(1);
  }
};

module.exports = DBconn;