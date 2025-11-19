module.exports = function authorizeAdminByToken(pool, allow = ["superadmin","manager","staff"]) {
  return async function (req, res, next) {
    try {
      const u = req.user;
      if (!u) return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });
      if (u.typ !== "admin") return res.status(403).json({ message: "สำหรับผู้ดูแลระบบเท่านั้น" });

      const [rows] = await pool.execute(
        `SELECT r.code
           FROM admin_role_map m
           JOIN admin_roles r ON r.id = m.role_id
          WHERE m.admin_id = ?`,
        [u.id]
      );
      const codes = rows.map(r => r.code);
      
      req.adminRoles = codes;

      const ok = codes.some(c => allow.includes(c));
      if (!ok) return res.status(403).json({ message: "สิทธิ์ไม่เพียงพอ" });

      next();
    } catch (e) {
      console.error("authorizeAdminByToken error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
};
