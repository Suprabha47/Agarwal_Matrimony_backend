const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // admin roles (1 = super admin, 2 = admin)
    if (!decoded || (decoded.role !== 1 && decoded.role !== 2)) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token. Please log in again." });
    }

    if (error.name === "NotBeforeError") {
      return res
        .status(401)
        .json({ message: "Token not yet active. Try again later." });
    }
    s;
    return res.status(401).json({ message: "Unauthorized" });
  }
};
