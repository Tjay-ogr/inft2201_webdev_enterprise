const express = require("express");
const mailData = require("../data/mail");

const authenticateJWT = require("../middleware/authenticateJWT");
const authorize = require("../middleware/authorize");
const canViewMail = require("../policies/canViewMail");

const router = express.Router();

// Resource loader for /mail/:id
function loadMail(req, res, next) {
  const id = parseInt(req.params.id, 10);
  const mail = mailData.find(m => m.id === id);

  if (!mail) {
    return next({
      statusCode: 404,
      error: "NotFound",
      message: "Mail not found"
    });
  }

  req.mail = mail;
  next();
}

// GET /mail/:id
router.get("/:id",
  authenticateJWT,
  loadMail,
  authorize(canViewMail),
  (req, res) => {
    res.json(req.mail);
  }
);

module.exports = router;