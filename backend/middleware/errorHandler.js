// Global error handling middleware
const ErrorLog = require("../models/ErrorLog");

const errorHandler = async (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] Status: ${status}, Message: ${message}`, err);

  try {
    await ErrorLog.create({
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: status,
      message,
      level: "error",
      responseTime: 0,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
      userId: req.user?.id,
      stack: err.stack,
    });
  } catch (logErr) {
    console.error("Failed to save error log in errorHandler:", logErr);
  }

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
