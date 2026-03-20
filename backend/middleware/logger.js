// Simple logging middleware that also saves errors to DB
const ErrorLog = require("../models/ErrorLog");

const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    const level =
      res.statusCode >= 500
        ? "error"
        : res.statusCode >= 400
          ? "warning"
          : "info";

    const logPayload = {
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      message: res.statusMessage || "",
      level,
      responseTime: duration,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
      userId: req.user?.id,
    };

    // Persist only warning/error responses to avoid DB noise
    if (level !== "info") {
     await ErrorLog.create(logPayload).catch((err) => {
        console.error("Error saving ErrorLog:", err);
      });
    }

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.path} - Status: ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

module.exports = { logger };
