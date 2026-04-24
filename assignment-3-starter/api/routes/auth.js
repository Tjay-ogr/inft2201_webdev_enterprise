const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users.js");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // check input
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // find user
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // create token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;