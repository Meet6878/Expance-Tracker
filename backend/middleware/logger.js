// Simple logging middleware
const logger = (req, res, next) => {
  const start = Date.now();

  res.on("close", () => {
    const duration = Date.now() - start;
    const level =
      res.statusCode >= 500
        ? "error"
        : res.statusCode >= 400
          ? "warning"
          : "info";

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.path} - Status: ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

module.exports = { logger };
