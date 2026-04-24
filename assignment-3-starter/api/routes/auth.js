import express from "express";
import jwt from "jsonwebtoken";
import users from "../data/users.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // check missing
  if (!username || !password) {
    return next({
      statusCode: 400,
      error: "BadRequest",
      message: "Username and password required"
    });
  }

  // find user
  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return next({
      statusCode: 401,
      error: "Unauthorized",
      message: "Invalid credentials"
    });
  }

  // create token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

export default router;