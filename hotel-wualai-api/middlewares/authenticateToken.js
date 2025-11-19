const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    (err, payload) => {
      if (err) return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
      req.user = payload;
      next();
    }
  );
}

module.exports = { authenticateToken };
