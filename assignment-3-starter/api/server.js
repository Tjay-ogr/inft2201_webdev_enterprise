const express = require("express");
const requestLogger = require("./middleware/requestLogger");
const rateLimiter = require("./middleware/rateLimiter"); // <-- ADD THIS
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const mailRoutes = require("./routes/mail");
const statusRoutes = require("./routes/status");

const app = express();

app.use(express.json());

// Attach request logger early
app.use(requestLogger);

//ADD RATE LIMITER HERE (before routes)
app.use(rateLimiter);

// Mount routes
app.use("/status", statusRoutes);
app.use("/auth", authRoutes);
app.use("/mail", mailRoutes);

// Centralized error handler LAST
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Assignment 3 API listening on port ${PORT}`);
});