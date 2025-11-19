const bcrypt = require("bcryptjs");

async function getAdminRoleIdsByCodes(poolOrConn, codes = []) {
    if (!codes?.length) return [];
    const placeholders = codes.map(() => "?").join(",");
    const [rows] = await poolOrConn.execute(
        `SELECT id, code FROM admin_roles WHERE code IN (${placeholders})`,
        codes
    );
    const map = new Map(rows.map(r => [r.code, r.id]));
    return codes.map(c => map.get(c)).filter(Boolean);
}

function clampInt(v, min, max) {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
}

function makeListAdmins(pool) {
    return async function listAdmins(req, res) {
        try {
            const page = clampInt(req.query.page, 1, 1_000_000) || 1;
            const limit = clampInt(req.query.limit, 1, 100) || 20;
            const offset = (page - 1) * limit;

            const q = (req.query.q || "").trim();
            const status = (req.query.status || "%").toString();

            const params = [];
            let where = "WHERE a.status LIKE ?"; params.push(status);
            if (q) {
                where += " AND (a.email LIKE ? OR a.full_name LIKE ? OR a.phone LIKE ?)";
                params.push(`%${q}%`, `%${q}%`, `%${q}%`);
            }

            const [rows] = await pool.query(
                `
        SELECT a.id, a.email, a.full_name, a.phone, a.status, a.created_at,
               COALESCE(JSON_ARRAYAGG(JSON_OBJECT('code', r.code, 'name', r.name)), JSON_ARRAY()) AS roles
          FROM admins a
     LEFT JOIN admin_role_map arm ON arm.admin_id = a.id
     LEFT JOIN admin_roles r      ON r.id = arm.role_id
          ${where}
      GROUP BY a.id
      ORDER BY a.created_at DESC
         LIMIT ${limit} OFFSET ${offset}
        `,
                params
            );

            const [[{ total }]] = await pool.query(`SELECT COUNT(*) total FROM admins a ${where}`, params);

            res.json({
                page, limit, total: Number(total || 0),
                items: rows.map(r => ({
                    ...r,
                    roles: typeof r.roles === "string" ? JSON.parse(r.roles) : (r.roles || []),
                }))
            });
        } catch (e) {
            console.error("listAdmins error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeGetAdmin(pool) {
    return async function getAdmin(req, res) {
        try {
            const { id } = req.params;
            const [[a]] = await pool.execute(
                `SELECT id, email, full_name, phone, status, created_at FROM admins WHERE id = ?`,
                [id]
            );
            if (!a) return res.status(404).json({ message: "ไม่พบผู้ดูแล" });

            const [roles] = await pool.execute(
                `SELECT r.code, r.name
           FROM admin_role_map arm
           JOIN admin_roles r ON r.id = arm.role_id
          WHERE arm.admin_id = ?`,
                [id]
            );

            res.json({ ...a, roles });
        } catch (e) {
            console.error("getAdmin error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeCreateAdmin(pool) {
    return async function createAdmin(req, res) {
        const conn = await pool.getConnection();
        try {
            const { email, password, full_name, phone, status = "active", roles = ["staff"] } = req.body;

            const [[dup]] = await conn.execute(`SELECT id FROM admins WHERE email = ?`, [email]);
            if (dup) { conn.release(); return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" }); }

            await conn.beginTransaction();

            const hash = await bcrypt.hash(password, 10);
            const [r] = await conn.execute(
                `INSERT INTO admins (email, password_hash, full_name, phone, status) VALUES (?,?,?,?,?)`,
                [email, hash, full_name || null, phone || null, status]
            );
            const adminId = r.insertId;

            const roleCodes = Array.isArray(roles) && roles.length ? roles : ["staff"];
            const roleIds = await getAdminRoleIdsByCodes(conn, roleCodes);
            if (roleIds.length) {
                const values = roleIds.map(rid => [adminId, rid]);
                await conn.query(`INSERT INTO admin_role_map (admin_id, role_id) VALUES ?`, [values]);
            }

            await conn.commit();
            res.status(201).json({ id: adminId, message: "สร้างผู้ดูแลสำเร็จ" });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("createAdmin error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    };
}

function makeUpdateAdmin(pool) {
    return async function updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { email, full_name, phone, status } = req.body;

            if (email) {
                const [[dup]] = await pool.execute(`SELECT id FROM admins WHERE email = ? AND id <> ?`, [email, id]);
                if (dup) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
            }

            await pool.execute(
                `UPDATE admins
            SET email = COALESCE(?, email),
                full_name = COALESCE(?, full_name),
                phone = COALESCE(?, phone),
                status = COALESCE(?, status)
          WHERE id = ?`,
                [email ?? null, full_name ?? null, phone ?? null, status ?? null, id]
            );
            res.json({ message: "อัปเดตผู้ดูแลเรียบร้อย" });
        } catch (e) {
            console.error("updateAdmin error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeChangeAdminPassword(pool) {
    return async function changePassword(req, res) {
        try {
            const { id } = req.params;
            const { new_password } = req.body;
            if (!new_password || new_password.length < 6) {
                return res.status(400).json({ message: "รหัสผ่านใหม่ไม่ถูกต้อง (อย่างน้อย 6 ตัวอักษร)" });
            }
            const hash = await bcrypt.hash(new_password, 10);
            await pool.execute(`UPDATE admins SET password_hash = ? WHERE id = ?`, [hash, id]);
            res.json({ message: "เปลี่ยนรหัสผ่านแล้ว" });
        } catch (e) {
            console.error("changeAdminPassword error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeUpdateAdminStatus(pool) {
    return async function updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'active' | 'suspended'
            if (!["active", "suspended"].includes(status)) {
                return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
            }
            await pool.execute(`UPDATE admins SET status = ? WHERE id = ?`, [status, id]);
            res.json({ message: "อัปเดตสถานะแล้ว" });
        } catch (e) {
            console.error("updateAdminStatus error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeSetAdminRoles(pool) {
    return async function setRoles(req, res) {
        const conn = await pool.getConnection();
        try {
            const { id } = req.params;
            const { roles = [] } = req.body;
            await conn.beginTransaction();

            await conn.execute(`DELETE FROM admin_role_map WHERE admin_id = ?`, [id]);

            const roleIds = await getAdminRoleIdsByCodes(conn, roles);
            if (roleIds.length) {
                const values = roleIds.map(rid => [id, rid]);
                await conn.query(`INSERT INTO admin_role_map (admin_id, role_id) VALUES ?`, [values]);
            }

            await conn.commit();
            res.json({ message: "อัปเดตสิทธิ์ผู้ดูแลเรียบร้อย" });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("setAdminRoles error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    };
}

function makeListAdminRoles(pool) {
    return async function listAdminRoles(_req, res) {
        try {
            const [rows] = await pool.query(`SELECT id, code, name FROM admin_roles ORDER BY id ASC`);
            res.json(rows);
        } catch (e) {
            console.error("listAdminRoles error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeCreateAdminRole(pool) {
    return async function createAdminRole(req, res) {
        try {
            const { code, name } = req.body;
            if (!code || !name) return res.status(400).json({ message: "กรอก code และ name" });

            const [[dup]] = await pool.execute(`SELECT id FROM admin_roles WHERE code = ?`, [code]);
            if (dup) return res.status(400).json({ message: "code นี้ถูกใช้งานแล้ว" });

            const [r] = await pool.execute(
                `INSERT INTO admin_roles (code, name) VALUES (?,?)`,
                [code.trim(), name.trim()]
            );
            res.status(201).json({ id: r.insertId, message: "สร้างบทบาทสำเร็จ" });
        } catch (e) {
            console.error("createAdminRole error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeUpdateAdminRole(pool) {
    return async function updateAdminRole(req, res) {
        try {
            const { id } = req.params;
            const { code, name } = req.body;
            if (!code && !name) return res.status(400).json({ message: "ไม่มีข้อมูลอัปเดต" });

            if (code) {
                const [[dup]] = await pool.execute(`SELECT id FROM admin_roles WHERE code = ? AND id <> ?`, [code, id]);
                if (dup) return res.status(400).json({ message: "code นี้ถูกใช้งานแล้ว" });
            }

            await pool.execute(
                `UPDATE admin_roles
            SET code = COALESCE(?, code),
                name = COALESCE(?, name)
          WHERE id = ?`,
                [code ?? null, name ?? null, id]
            );
            res.json({ message: "อัปเดตบทบาทเรียบร้อย" });
        } catch (e) {
            console.error("updateAdminRole error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeDeleteAdminRole(pool) {
    return async function deleteAdminRole(req, res) {
        try {
            const { id } = req.params;
            await pool.execute(`DELETE FROM admin_roles WHERE id = ?`, [id]);
            res.json({ message: "ลบบทบาทแล้ว" });
        } catch (e) {
            console.error("deleteAdminRole error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

module.exports = {
    makeListAdmins,
    makeGetAdmin,
    makeCreateAdmin,
    makeUpdateAdmin,
    makeChangeAdminPassword,
    makeUpdateAdminStatus,
    makeSetAdminRoles,

    makeListAdminRoles,
    makeCreateAdminRole,
    makeUpdateAdminRole,
    makeDeleteAdminRole,
};
