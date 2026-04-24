module.exports = (policy) => {
  return (req, res, next) => {
    const user = req.user;
    const resource = req.mail;

    //safety check
    if (!user || !resource) {
      return res.status(500).json({ error: "Authorization context missing" });
    }

    if (!policy(user, resource)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};