function saneInt(n, def, min = 1, max = 200) {
    const v = parseInt(n, 10);
    if (!Number.isFinite(v)) return def;
    return Math.min(max, Math.max(min, v));
}

function makeList(pool) {
    return async function list(req, res) {
        try {
            const page = saneInt(req.query.page, 1, 1, 999999);
            const limit = saneInt(req.query.limit, 20, 1, 200);
            const offset = (page - 1) * limit;

            const q = (req.query.q || "").trim();
            const active = req.query.active; // "1" | "0" | undefined

            let where = "WHERE 1";
            const params = [];

            if (q) {
                where += " AND (title LIKE ? OR subtitle LIKE ? OR cta_text LIKE ? OR cta_link LIKE ?)";
                params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
            }
            if (active === "1") where += " AND is_active = 1";
            if (active === "0") where += " AND is_active = 0";

            const sql = `
        SELECT id, title, subtitle, cta_text, cta_link, image_path, sort_order, is_active
        FROM home_slides
        ${where}
        ORDER BY sort_order ASC, id ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
            const [rows] = await pool.query(sql, params);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) total FROM home_slides ${where}`,
                params
            );

            res.json({ page, limit, total, items: rows });
        } catch (e) {
            console.error("list slides error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeGet(pool) {
    return async function get(req, res) {
        try {
            const { id } = req.params;
            const [[row]] = await pool.execute(
                `SELECT id, title, subtitle, cta_text, cta_link, image_path, sort_order, is_active
         FROM home_slides WHERE id = ?`,
                [id]
            );
            if (!row) return res.status(404).json({ message: "ไม่พบสไลด์" });
            res.json(row);
        } catch (e) {
            console.error("get slide error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeCreate(pool) {
    return async function create(req, res) {
        try {
            const {
                title = "",
                subtitle = "",
                cta_text = "",
                cta_link = "#",
                image_path = "",
                sort_order,
                is_active = 1,
            } = req.body;

            let so = Number.isFinite(Number(sort_order)) ? Number(sort_order) : null;
            if (so == null) {
                const [[{ maxso }]] = await pool.query(`SELECT COALESCE(MAX(sort_order),0) AS maxso FROM home_slides`);
                so = (maxso || 0) + 1;
            }

            const [r] = await pool.execute(
                `INSERT INTO home_slides (title, subtitle, cta_text, cta_link, image_path, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, subtitle, cta_text, cta_link, image_path, so, is_active ? 1 : 0]
            );

            res.status(201).json({ id: r.insertId, message: "สร้างสไลด์สำเร็จ" });
        } catch (e) {
            console.error("create slide error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeUpdate(pool) {
    return async function update(req, res) {
        try {
            const { id } = req.params;
            const {
                title,
                subtitle,
                cta_text,
                cta_link,
                image_path,
                sort_order,
                is_active,
            } = req.body;

            await pool.execute(
                `UPDATE home_slides
         SET title = COALESCE(?, title),
             subtitle = COALESCE(?, subtitle),
             cta_text = COALESCE(?, cta_text),
             cta_link = COALESCE(?, cta_link),
             image_path = COALESCE(?, image_path),
             sort_order = COALESCE(?, sort_order),
             is_active = COALESCE(?, is_active)
         WHERE id = ?`,
                [
                    title ?? null,
                    subtitle ?? null,
                    cta_text ?? null,
                    cta_link ?? null,
                    image_path ?? null,
                    (typeof sort_order === "number" ? sort_order : null),
                    (typeof is_active === "number" ? is_active : null),
                    id,
                ]
            );

            res.json({ message: "อัปเดตสไลด์เรียบร้อย" });
        } catch (e) {
            console.error("update slide error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeToggleStatus(pool) {
    return async function toggle(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body; // 1|0
            if (![0, 1, "0", "1"].includes(is_active)) {
                return res.status(400).json({ message: "ค่าสถานะไม่ถูกต้อง" });
            }
            await pool.execute(`UPDATE home_slides SET is_active = ? WHERE id = ?`, [Number(is_active), id]);
            res.json({ message: "อัปเดตสถานะแล้ว" });
        } catch (e) {
            console.error("toggle slide status error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeRemove(pool) {
    return async function remove(req, res) {
        try {
            const { id } = req.params;
            await pool.execute(`DELETE FROM home_slides WHERE id = ?`, [id]);
            res.json({ message: "ลบสไลด์แล้ว" });
        } catch (e) {
            console.error("delete slide error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeReorder(pool) {
    return async function reorder(req, res) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || !ids.length) {
                return res.status(400).json({ message: "รูปแบบไม่ถูกต้อง (ต้องเป็น { ids: number[] })" });
            }
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                for (let i = 0; i < ids.length; i++) {
                    await conn.execute(`UPDATE home_slides SET sort_order = ? WHERE id = ?`, [i + 1, ids[i]]);
                }
                await conn.commit();
            } catch (e) {
                await conn.rollback();
                throw e;
            } finally {
                conn.release();
            }
            res.json({ message: "บันทึกลำดับแล้ว" });
        } catch (e) {
            console.error("reorder slides error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

module.exports = {
    makeList,
    makeGet,
    makeCreate,
    makeUpdate,
    makeToggleStatus,
    makeRemove,
    makeReorder,
};
