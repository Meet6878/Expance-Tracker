exports.getDateRange = (type) => {
  const now = new Date();

  if (type === "weekly") {
    const start = new Date();
    start.setDate(now.getDate() - 7);
    return { start, end: now };
  }

  if (type === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  }
};