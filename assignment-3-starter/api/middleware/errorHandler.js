module.exports = (err, req, res, next) => {
  //log error for debugging
  console.error(`Unhandled error for request ${req.requestId}`, err);

  if (err.statusCode === 429 && err.retryAfter) {
    res.set("Retry-After", err.retryAfter.toString());
  }

  res.status(err.statusCode || 500).json({
    error: err.error || "InternalServerError",
    message: err.message || "Something went wrong",
    statusCode: err.statusCode || 500,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString()
  });
};