module.exports = function makeRoomTypesController(pool) {

    function parseImages(val) {
        if (Array.isArray(val)) return val;
        if (typeof val === "string" && val.trim()) {
            try { const v = JSON.parse(val); return Array.isArray(v) ? v : []; } catch { }
            return val.split("\n").map(s => s.trim()).filter(Boolean);
        }
        return [];
    }

    async function list(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page || "1", 10));
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
            const offset = (page - 1) * limit;

            const q = (req.query.q || "").trim();
            const status = (req.query.status || "%").toString();  // '%', 'active', 'inactive'

            const params = [];
            let where = "WHERE 1";
            if (q) {
                where += " AND (rt.code LIKE ? OR rt.name LIKE ? OR rt.description LIKE ?)";
                params.push(`%${q}%`, `%${q}%`, `%${q}%`);
            }
            if (status === "active") where += " AND rt.is_active = 1";
            if (status === "inactive") where += " AND rt.is_active = 0";

            const [rows] = await pool.execute(`
        SELECT rt.id, rt.code, rt.name, rt.description, rt.base_price, rt.capacity,
               rt.images_json, rt.is_active
        FROM room_types rt
        ${where}
        ORDER BY rt.id DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `, params);

            const [[{ total }]] = await pool.execute(`
        SELECT COUNT(*) total
        FROM room_types rt
        ${where}
      `, params);

            res.json({
                page, limit, total,
                items: rows.map(r => ({ ...r, images: parseImages(r.images_json) }))
            });
        } catch (e) {
            console.error("list room_types error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function getOne(req, res) {
        try {
            const { id } = req.params;
            const [[row]] = await pool.execute(`
        SELECT rt.id, rt.code, rt.name, rt.description, rt.base_price, rt.capacity,
               rt.images_json, rt.is_active
        FROM room_types rt
        WHERE rt.id = ?
      `, [id]);
            if (!row) return res.status(404).json({ message: "ไม่พบประเภทห้อง" });

            const [rooms] = await pool.execute(`
        SELECT id, room_no, status
        FROM rooms
        WHERE room_type_id = ?
        ORDER BY CAST(room_no AS UNSIGNED), room_no
      `, [id]);

            res.json({
                ...row,
                images: parseImages(row.images_json),
                rooms,
            });
        } catch (e) {
            console.error("get room_type error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function create(req, res) {
        try {
            const { code, name, description = null, base_price = 0, capacity = 0, images = [], is_active = 1 } = req.body;
            const [[dup]] = await pool.execute(`SELECT id FROM room_types WHERE code = ?`, [code]);
            if (dup) return res.status(400).json({ message: "รหัส (code) นี้ถูกใช้งานแล้ว" });

            const imgs = JSON.stringify(parseImages(images));
            const [r] = await pool.execute(`
        INSERT INTO room_types (code, name, description, base_price, capacity, images_json, is_active)
        VALUES (?,?,?,?,?,?,?)
      `, [code, name, description, Number(base_price) || 0, Number(capacity) || 0, imgs, is_active ? 1 : 0]);

            res.status(201).json({ id: r.insertId, message: "สร้างประเภทห้องสำเร็จ" });
        } catch (e) {
            console.error("create room_type error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function update(req, res) {
        try {
            const { id } = req.params;
            const { code, name, description, base_price, capacity, images, is_active } = req.body;

            if (code) {
                const [[dup]] = await pool.execute(`SELECT id FROM room_types WHERE code = ? AND id <> ?`, [code, id]);
                if (dup) return res.status(400).json({ message: "รหัส (code) นี้ถูกใช้งานแล้ว" });
            }

            await pool.execute(`
        UPDATE room_types
        SET code = COALESCE(?, code),
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            base_price = COALESCE(?, base_price),
            capacity   = COALESCE(?, capacity),
            images_json = COALESCE(?, images_json),
            is_active  = COALESCE(?, is_active)
        WHERE id = ?
      `, [
                code ?? null,
                name ?? null,
                description ?? null,
                (base_price !== undefined ? Number(base_price) : null),
                (capacity !== undefined ? Number(capacity) : null),
                (images !== undefined ? JSON.stringify(parseImages(images)) : null),
                (typeof is_active === "number" ? (is_active ? 1 : 0) : null),
                id
            ]);

            res.json({ message: "อัปเดตเรียบร้อย" });
        } catch (e) {
            console.error("update room_type error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function updateStatus(req, res) {
        try {
            const { id } = req.params;
            let { status, is_active } = req.body;
            if (status) is_active = (status === "active") ? 1 : 0;
            await pool.execute(`UPDATE room_types SET is_active = ? WHERE id = ?`, [is_active ? 1 : 0, id]);
            res.json({ message: "อัปเดตสถานะเรียบร้อย" });
        } catch (e) {
            console.error("updateStatus room_type error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function remove(req, res) {
        try {
            const { id } = req.params;
            await pool.execute(`UPDATE room_types SET is_active = 0 WHERE id = ?`, [id]);
            res.json({ message: "ปิดการใช้งานแล้ว" });
        } catch (e) {
            console.error("remove room_type error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }
    function parseImages(val) {
        if (Array.isArray(val)) return val.filter(Boolean);
        if (typeof val === "string" && val.trim()) {
            try { const v = JSON.parse(val); return Array.isArray(v) ? v.filter(Boolean) : []; } catch { }
            return val.split("\n").map(s => s.trim()).filter(Boolean);
        }
        return [];
    }

    async function _getCurrentImages(pool, id) {
        const [[rt]] = await pool.execute(`SELECT images_json FROM room_types WHERE id = ?`, [id]);
        if (!rt) return null;
        return parseImages(rt.images_json);
    }

    async function addImages(req, res) {
        try {
            const { id } = req.params;
            const current = await _getCurrentImages(req.app.locals.pool || req.pool || pool, id);
            if (current === null) return res.status(404).json({ message: "ไม่พบประเภทห้อง" });

            const files = (req.files || []).map(f => `/uploads/${f.filename}`);
            const next = [...current, ...files];

            await pool.execute(`UPDATE room_types SET images_json = ? WHERE id = ?`, [JSON.stringify(next), id]);

            res.status(201).json({ added: files, images: next });
        } catch (e) {
            console.error("addImages error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function removeImage(req, res) {
        try {
            const { id } = req.params;
            const current = await _getCurrentImages(req.app.locals.pool || req.pool || pool, id);
            if (current === null) return res.status(404).json({ message: "ไม่พบประเภทห้อง" });

            const path = req.body?.path || req.query?.path;
            const index = (req.body?.index ?? req.query?.index);

            let next = current.slice();
            if (typeof index !== "undefined") {
                const i = Number(index);
                if (Number.isInteger(i) && i >= 0 && i < next.length) next.splice(i, 1);
            } else if (path) {
                next = next.filter(p => p !== path);
            } else {
                return res.status(400).json({ message: "ต้องระบุ path หรือ index" });
            }

            await pool.execute(`UPDATE room_types SET images_json = ? WHERE id = ?`, [JSON.stringify(next), id]);
            res.json({ images: next });
        } catch (e) {
            console.error("removeImage error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function setImages(req, res) {
        try {
            const { id } = req.params;
            let { images } = req.body;
            if (!Array.isArray(images)) return res.status(400).json({ message: "images ต้องเป็น array ของ string" });

            images = images.filter(Boolean);
            await pool.execute(`UPDATE room_types SET images_json = ? WHERE id = ?`, [JSON.stringify(images), id]);
            res.json({ images });
        } catch (e) {
            console.error("setImages error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    return { list, getOne, create, update, updateStatus, remove, addImages, removeImage, setImages };
};
