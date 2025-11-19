function makeListRoomTypesForSelect(pool) {
    return async function listRoomTypesForSelect(_req, res) {
        try {
            const [rows] = await pool.query(`
        SELECT rt.id, rt.code, rt.name, rt.capacity, rt.base_price, rt.is_active,
               COUNT(r.id) AS rooms
        FROM room_types rt
        LEFT JOIN rooms r
          ON r.room_type_id = rt.id AND r.status <> 'inactive'
        GROUP BY rt.id
        ORDER BY rt.base_price ASC, rt.id ASC
      `);
            res.json(rows);
        } catch (e) {
            console.error("listRoomTypesForSelect error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}


function makeListRooms(pool) {
    return async function listRooms(req, res) {
        try {
            const pageParsed = parseInt(req.query.page ?? "1", 10);
            const limitParsed = parseInt(req.query.limit ?? "20", 10);
            const page = Number.isFinite(pageParsed) ? Math.max(1, pageParsed) : 1;
            const limit = Number.isFinite(limitParsed) ? Math.min(100, Math.max(1, limitParsed)) : 20;
            const offset = (page - 1) * limit;

            const status = (req.query.status ?? "%").toString();
            const q = (req.query.q || "").trim();
            const roomTypeId = req.query.room_type_id ? Number(req.query.room_type_id) : null;

            const where = [];
            const params = [];

            where.push("r.status LIKE ?");
            params.push(status);

            if (roomTypeId) {
                where.push("r.room_type_id = ?");
                params.push(roomTypeId);
            }
            if (q) {
                where.push("(r.room_no LIKE ? OR rt.name LIKE ?)");
                params.push(`%${q}%`, `%${q}%`);
            }

            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

            const sql = `
        SELECT r.id, r.room_no, r.room_type_id, r.floor, r.status, r.created_at, r.updated_at,
               rt.name AS room_type_name, rt.capacity
        FROM rooms r
        JOIN room_types rt ON rt.id = r.room_type_id
        ${whereSql}
        ORDER BY CAST(r.room_no AS UNSIGNED), r.room_no
        LIMIT ${limit} OFFSET ${offset}
      `;
            const [rows] = await pool.execute(sql, params);

            const countSql = `
        SELECT COUNT(*) AS total
        FROM rooms r
        JOIN room_types rt ON rt.id = r.room_type_id
        ${whereSql}
      `;
            const [[{ total } = { total: 0 }]] = await pool.execute(countSql, params);

            res.json({ page, limit, total, items: rows });
        } catch (e) {
            console.error("listRooms error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}



function makeGetRoom(pool) {
    return async function getRoom(req, res) {
        try {
            const { id } = req.params;

            const [[room]] = await pool.execute(
                `
        SELECT r.id, r.room_no, r.room_type_id, r.floor, r.status, r.created_at, r.updated_at,
               rt.name AS room_type_name, rt.capacity, rt.base_price
        FROM rooms r
        JOIN room_types rt ON rt.id = r.room_type_id
        WHERE r.id = ?
        `,
                [id]
            );
            if (!room) return res.status(404).json({ message: "ไม่พบห้องพัก" });

            const [bookings] = await pool.execute(
                `
        SELECT b.id, b.booking_no, b.status,
               b.check_in_date, b.check_out_date, b.nights, b.total_amount,
               g.full_name AS guest_name, g.phone AS guest_phone
        FROM bookings b
        JOIN guests g ON g.id = b.guest_id
        WHERE b.room_id = ?
        ORDER BY b.created_at DESC
        LIMIT 10
        `,
                [id]
            );

            const [housekeep] = await pool.execute(
                `
        SELECT id, task_date, task_type, priority, status, notes
        FROM housekeeping_tasks
        WHERE room_id = ?
        ORDER BY task_date DESC, id DESC
        LIMIT 5
        `,
                [id]
            );

            res.json({ room, bookings, housekeeping: housekeep });
        } catch (e) {
            console.error("getRoom error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeCreateRoom(pool) {
    return async function createRoom(req, res) {
        try {
            const { room_no, room_type_id, floor = null, status = "active" } = req.body;
            if (!room_no || !room_type_id) {
                return res.status(400).json({ message: "กรุณาระบุ room_no และ room_type_id" });
            }
            if (!["active", "inactive", "maintenance"].includes(status)) {
                return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
            }

            const [[dup]] = await pool.execute(
                "SELECT id FROM rooms WHERE room_no = ?",
                [room_no]
            );
            if (dup) return res.status(400).json({ message: "หมายเลขห้องนี้ถูกใช้งานแล้ว" });

            const [[rt]] = await pool.execute("SELECT id FROM room_types WHERE id = ?", [room_type_id]);
            if (!rt) return res.status(400).json({ message: "ไม่พบประเภทห้อง" });

            const [r] = await pool.execute(
                `INSERT INTO rooms (room_no, room_type_id, floor, status)
         VALUES (?, ?, ?, ?)`,
                [room_no, room_type_id, floor, status]
            );
            res.status(201).json({ id: r.insertId, message: "สร้างห้องพักสำเร็จ" });
        } catch (e) {
            console.error("createRoom error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeUpdateRoom(pool) {
    return async function updateRoom(req, res) {
        try {
            const { id } = req.params;
            const { room_no, room_type_id, floor, status } = req.body;

            if (status && !["active", "inactive", "maintenance"].includes(status)) {
                return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
            }

            if (room_no) {
                const [[dup]] = await pool.execute(
                    "SELECT id FROM rooms WHERE room_no = ? AND id <> ?",
                    [room_no, id]
                );
                if (dup) return res.status(400).json({ message: "หมายเลขห้องนี้ถูกใช้งานแล้ว" });
            }

            if (room_type_id) {
                const [[rt]] = await pool.execute("SELECT id FROM room_types WHERE id = ?", [room_type_id]);
                if (!rt) return res.status(400).json({ message: "ไม่พบประเภทห้อง" });
            }

            await pool.execute(
                `UPDATE rooms
         SET room_no      = COALESCE(?, room_no),
             room_type_id = COALESCE(?, room_type_id),
             floor        = COALESCE(?, floor),
             status       = COALESCE(?, status)
         WHERE id = ?`,
                [room_no ?? null, room_type_id ?? null, floor ?? null, status ?? null, id]
            );
            res.json({ message: "อัปเดตห้องพักเรียบร้อย" });
        } catch (e) {
            console.error("updateRoom error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeUpdateRoomStatus(pool) {
    return async function updateRoomStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!["active", "inactive", "maintenance"].includes(status)) {
                return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
            }
            await pool.execute("UPDATE rooms SET status = ? WHERE id = ?", [status, id]);
            res.json({ message: "อัปเดตสถานะเรียบร้อย" });
        } catch (e) {
            console.error("updateRoomStatus error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

function makeDeleteRoom(pool) {
    return async function deleteRoom(req, res) {
        try {
            const { id } = req.params;
            await pool.execute("UPDATE rooms SET status = 'inactive' WHERE id = ?", [id]);
            res.json({ message: "ปิดใช้งานห้องแล้ว" });
        } catch (e) {
            console.error("deleteRoom error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    };
}

module.exports = {
    makeListRoomTypesForSelect,
    makeListRooms,
    makeGetRoom,
    makeCreateRoom,
    makeUpdateRoom,
    makeUpdateRoomStatus,
    makeDeleteRoom,
};
