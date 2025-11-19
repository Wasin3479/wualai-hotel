const bcrypt = require("bcryptjs");

function makeGetMe(pool) {
    return async function getMe(req, res) {
        try {
            const adminId = req.user?.id;
            if (!adminId) return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });

            const [[me]] = await pool.execute(
                `SELECT id, email, full_name, phone, status, created_at
           FROM admins
          WHERE id = ?`,
                [adminId]
            );
            if (!me) return res.status(404).json({ message: "ไม่พบบัญชี" });

            const [roles] = await pool.execute(
                `SELECT r.code, r.name
           FROM admin_role_map m
           JOIN admin_roles r ON r.id = m.role_id
          WHERE m.admin_id = ?`,
                [adminId]
            );

            res.json({ ...me, roles });
        } catch (e) {
            console.error("getMe error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeUpdateMyProfile(pool) {
    return async function updateMyProfile(req, res) {
        try {
            const adminId = req.user?.id;
            if (!adminId) return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });

            const { email, full_name, phone } = req.body || {};

            if (email) {
                const [[dup]] = await pool.execute(
                    `SELECT id FROM admins WHERE email = ? AND id <> ?`,
                    [email, adminId]
                );
                if (dup) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
            }

            await pool.execute(
                `UPDATE admins
            SET email = COALESCE(?, email),
                full_name = COALESCE(?, full_name),
                phone = COALESCE(?, phone)
          WHERE id = ?`,
                [email ?? null, full_name ?? null, phone ?? null, adminId]
            );

            res.json({ message: "บันทึกโปรไฟล์แล้ว" });
        } catch (e) {
            console.error("updateMyProfile error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeChangeMyPassword(pool) {
    return async function changeMyPassword(req, res) {
        try {
            const adminId = req.user?.id;
            if (!adminId) return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });

            const { new_password } = req.body || {};
            if (!new_password || String(new_password).length < 6) {
                return res.status(400).json({ message: "รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร" });
            }

            const hash = await bcrypt.hash(String(new_password), 10);
            await pool.execute(
                `UPDATE admins SET password_hash = ? WHERE id = ?`,
                [hash, adminId]
            );

            res.json({ message: "เปลี่ยนรหัสผ่านแล้ว" });
        } catch (e) {
            console.error("changeMyPassword error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

module.exports = {
    makeGetMe,
    makeUpdateMyProfile,
    makeChangeMyPassword,
};
