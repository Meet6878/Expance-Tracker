const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmat = require("helmet");
const cors = require("cors");
const DBconn = require("./config/database");
const { logger } = require("./middleware/logger");
const { errorHandler } = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoutes");

dotenv.config();

const app = express();

DBconn();

app.use(helmat());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(logger);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log("server is running on ", PORT);
});
