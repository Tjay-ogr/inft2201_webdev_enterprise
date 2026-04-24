const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  const requestId = uuidv4();

  req.requestId = requestId;

  console.log(`[${requestId}] ${req.method} ${req.url}`);

  next();
};