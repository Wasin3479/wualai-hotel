function makeList(pool) {
    return async function list(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page || "1", 10));
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
            const q = (req.query.q || "").trim();

            const offset = (page - 1) * limit;
            const params = [];
            let where = "WHERE 1";

            if (q) {
                where += " AND (bank_name LIKE ? OR bank_code LIKE ? OR account_name LIKE ? OR account_number LIKE ?)";
                params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
            }

            const sql = `
        SELECT id, bank_code, bank_name, account_name, account_number,
               is_active, is_default, sort_order, created_at, updated_at
        FROM bank_accounts
        ${where}
        ORDER BY is_default DESC, sort_order ASC, id DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

            const [rows] = await pool.query(sql, params);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) total FROM bank_accounts ${where}`,
                params
            );

            res.json({ page, limit, total, items: rows });
        } catch (e) {
            console.error("bank.list error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeCreate(pool) {
    return async function create(req, res) {
        const conn = await pool.getConnection();
        try {
            const {
                bank_code, bank_name, account_name, account_number,
                is_active = 1, is_default = 0, sort_order = 0
            } = req.body || {};

            if (!bank_code || !bank_name || !account_name || !account_number) {
                conn.release();
                return res.status(400).json({ message: "กรอกข้อมูลให้ครบ (ธนาคาร/ชื่อบัญชี/เลขบัญชี)" });
            }

            await conn.beginTransaction();

            if (is_default) {
                await conn.execute(`UPDATE bank_accounts SET is_default = 0 WHERE is_default = 1`);
            }

            const [r] = await conn.execute(
                `INSERT INTO bank_accounts
         (bank_code, bank_name, account_name, account_number, is_active, is_default, sort_order)
         VALUES (?,?,?,?,?,?,?)`,
                [bank_code, bank_name, account_name, account_number,
                    Number(is_active) ? 1 : 0, Number(is_default) ? 1 : 0, Number(sort_order) || 0]
            );

            await conn.commit();
            res.status(201).json({ id: r.insertId, message: "เพิ่มบัญชีธนาคารแล้ว" });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("bank.create error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    };
}

function makeUpdate(pool) {
    return async function update(req, res) {
        const conn = await pool.getConnection();
        try {
            const { id } = req.params;
            const {
                bank_code, bank_name, account_name, account_number,
                is_active, is_default, sort_order
            } = req.body || {};

            await conn.beginTransaction();

            if (is_default === 1 || is_default === true || is_default === "1") {
                await conn.execute(`UPDATE bank_accounts SET is_default = 0 WHERE is_default = 1`);
            }

            await conn.execute(
                `UPDATE bank_accounts
         SET bank_code = COALESCE(?, bank_code),
             bank_name = COALESCE(?, bank_name),
             account_name = COALESCE(?, account_name),
             account_number = COALESCE(?, account_number),
             is_active = COALESCE(?, is_active),
             is_default = COALESCE(?, is_default),
             sort_order = COALESCE(?, sort_order)
         WHERE id = ?`,
                [
                    bank_code ?? null,
                    bank_name ?? null,
                    account_name ?? null,
                    account_number ?? null,
                    (typeof is_active === "number" ? is_active : (typeof is_active === "boolean" ? (is_active ? 1 : 0) : null)),
                    (typeof is_default === "number" ? is_default : (typeof is_default === "boolean" ? (is_default ? 1 : 0) : null)),
                    (typeof sort_order === "number" ? sort_order : null),
                    id
                ]
            );

            await conn.commit();
            res.json({ message: "อัปเดตบัญชีธนาคารแล้ว" });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("bank.update error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    };
}

function makeSetDefault(pool) {
    return async function setDefault(req, res) {
        const conn = await pool.getConnection();
        try {
            const { id } = req.params;
            await conn.beginTransaction();
            await conn.execute(`UPDATE bank_accounts SET is_default = 0 WHERE is_default = 1`);
            await conn.execute(`UPDATE bank_accounts SET is_default = 1, is_active = 1 WHERE id = ?`, [id]);
            await conn.commit();
            res.json({ message: "ตั้งค่าเป็นบัญชีหลักแล้ว" });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("bank.setDefault error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    };
}

function makeSetStatus(pool) {
    return async function setStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body || {};
            const v = (is_active === true || is_active === 1 || is_active === "1") ? 1 : 0;
            await pool.execute(`UPDATE bank_accounts SET is_active = ? WHERE id = ?`, [v, id]);
            res.json({ message: "อัปเดตสถานะแล้ว" });
        } catch (e) {
            console.error("bank.setStatus error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeRemove(pool) {
    return async function remove(req, res) {
        try {
            const { id } = req.params;
            await pool.execute(`DELETE FROM bank_accounts WHERE id = ?`, [id]);
            res.json({ message: "ลบบัญชีธนาคารแล้ว" });
        } catch (e) {
            console.error("bank.remove error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makePublicList(pool) {
    return async function publicList(_req, res) {
        try {
            const [rows] = await pool.query(
                `SELECT id, bank_code, bank_name, account_name, account_number, is_default
         FROM bank_accounts
         WHERE is_active = 1
         ORDER BY is_default DESC, sort_order ASC, id DESC`
            );
            res.json(rows);
        } catch (e) {
            console.error("bank.publicList error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

module.exports = {
    makeList,
    makeCreate,
    makeUpdate,
    makeSetDefault,
    makeSetStatus,
    makeRemove,
    makePublicList,
};
