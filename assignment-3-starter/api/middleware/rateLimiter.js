const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60) * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 5;

const buckets = new Map();

module.exports = (req, res, next) => {
  //use IP consistently (since this runs before auth)
  const key = req.ip;

  const now = Date.now();

  if (!buckets.has(key)) {
    buckets.set(key, { count: 1, windowStart: now });
    return next();
  }

  const bucket = buckets.get(key);

  if (now - bucket.windowStart > windowMs) {
    bucket.count = 1;
    bucket.windowStart = now;
    return next();
  }

  bucket.count++;

  if (bucket.count > maxRequests) {
    return next({
      statusCode: 429,
      error: "TooManyRequests",
      message: "Rate limit exceeded",
      retryAfter: Math.ceil((windowMs - (now - bucket.windowStart)) / 1000)
    });
  }

  next();
};