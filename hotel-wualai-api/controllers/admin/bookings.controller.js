const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");

function nightsBetween(ci, co) {
    const a = dayjs(ci); const b = dayjs(co);
    return Math.max(1, b.startOf("day").diff(a.startOf("day"), "day"));
}

function overlapWhere() {
    return `NOT (b.check_in_date >= ? OR b.check_out_date <= ?)`;
}

module.exports = function makeAdminBookingsController(pool) {

    async function listRoomTypes(_req, res) {
        const [rows] = await pool.query(`SELECT id, name, base_price, capacity FROM room_types WHERE is_active=1 ORDER BY base_price ASC`);
        res.json(rows);
    }
    async function listRooms(req, res) {
        const q = (req.query.q || "").trim();
        const rt = parseInt(req.query.room_type_id || "", 10) || null;
        const params = [];
        let where = `WHERE r.status IN ('active','maintenance','inactive')`;
        if (rt) { where += ` AND r.room_type_id = ?`; params.push(rt); }
        if (q) { where += ` AND (r.room_no LIKE ?)`; params.push(`%${q}%`); }
        const [rows] = await pool.execute(`
      SELECT r.id, r.room_no, r.room_type_id, r.status, COALESCE(rt.name,'-') room_type_name
      FROM rooms r
      LEFT JOIN room_types rt ON rt.id=r.room_type_id
      ${where}
      ORDER BY CAST(r.room_no AS UNSIGNED), r.room_no
    `, params);
        res.json(rows);
    }
    async function listGuestsQuick(req, res) {
        const q = (req.query.q || "").trim();
        const params = []; let where = "";
        if (q) { where = `WHERE (g.full_name LIKE ? OR g.email LIKE ? OR g.phone LIKE ?)`; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
        const [rows] = await pool.execute(`
      SELECT g.id, g.full_name, g.email, g.phone
      FROM guests g
      ${where}
      ORDER BY g.id DESC LIMIT 30
    `, params);
        res.json(rows);
    }

    async function listBookings(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page || "1", 10));
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
            const offset = (page - 1) * limit;

            const status = (req.query.status || "%").toString();
            const q = (req.query.q || "").trim();
            const rtId = parseInt(req.query.room_type_id || "", 10) || null;
            const dateFrom = req.query.date_from || null; // YYYY-MM-DD
            const dateTo = req.query.date_to || null;

            const params = [status];
            let where = `WHERE b.status LIKE ?`;

            if (q) {
                where += ` AND (b.booking_no LIKE ? OR g.full_name LIKE ? OR g.email LIKE ? OR g.phone LIKE ?)`;
                params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
            }
            if (rtId) { where += ` AND b.room_type_id = ?`; params.push(rtId); }
            if (dateFrom) { where += ` AND b.check_in_date >= ?`; params.push(dateFrom); }
            if (dateTo) { where += ` AND b.check_out_date <= ?`; params.push(dateTo); }

            const [rows] = await pool.execute(`
        SELECT b.id, b.booking_no, b.status, b.source,
               b.check_in_date, b.check_out_date, b.nights,
               b.adults, b.children, b.total_amount,
               rt.name AS room_type_name, r.room_no, g.full_name AS guest_name
        FROM bookings b
        JOIN room_types rt ON rt.id=b.room_type_id
        LEFT JOIN rooms r ON r.id=b.room_id
        JOIN guests g ON g.id=b.guest_id
        ${where}
        ORDER BY b.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `, params);

            const [[{ total }]] = await pool.execute(`
        SELECT COUNT(*) total
        FROM bookings b
        JOIN room_types rt ON rt.id=b.room_type_id
        JOIN guests g ON g.id=b.guest_id
        ${where}
      `, params);

            res.json({ page, limit, total, items: rows });
        } catch (e) {
            console.error("listBookings error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function getBooking(req, res) {
        try {
            const { id } = req.params;
            const [[bk]] = await pool.execute(`
        SELECT b.*, rt.name AS room_type_name, r.room_no,
               g.full_name AS guest_name, g.email AS guest_email, g.phone AS guest_phone
        FROM bookings b
        JOIN room_types rt ON rt.id=b.room_type_id
        LEFT JOIN rooms r ON r.id=b.room_id
        JOIN guests g ON g.id=b.guest_id
        WHERE b.id=?
      `, [id]);
            if (!bk) return res.status(404).json({ message: "ไม่พบการจอง" });

            const [payments] = await pool.execute(`
        SELECT p.id, p.method, p.amount, p.status, p.paid_at, p.created_at
        FROM payments p WHERE p.booking_id=? ORDER BY p.created_at DESC
      `, [id]);

            res.json({ booking: bk, payments });
        } catch (e) {
            console.error("getBooking error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function createBooking(req, res) {
        const conn = await pool.getConnection();
        try {
            const {
                guest_id, guest, room_type_id, room_id = null,
                check_in_date, check_out_date, adults = 2, children = 0,
                remarks = null, status = "pending", override_total = null
            } = req.body;

            await conn.beginTransaction();

            let gId = guest_id || null;
            if (!gId) {
                if (guest?.email) {
                    const [[ex]] = await conn.execute(`SELECT id FROM guests WHERE email=?`, [guest.email]);
                    if (ex) gId = ex.id;
                }
                if (!gId) {
                    const [r] = await conn.execute(
                        `INSERT INTO guests (full_name, email, phone) VALUES (?,?,?)`,
                        [guest?.full_name || null, guest?.email || null, guest?.phone || null]
                    );
                    gId = r.insertId;
                }
            }

            const [[rt]] = await conn.execute(`SELECT base_price FROM room_types WHERE id=?`, [room_type_id]);
            if (!rt) throw new Error("ไม่พบประเภทห้อง");
            const nights = nightsBetween(check_in_date, check_out_date);
            const total = override_total != null ? Number(override_total) : Number(rt.base_price) * nights;

            if (room_id) {
                const [conf] = await conn.execute(`
          SELECT b.id FROM bookings b
          WHERE b.room_id = ? AND b.status IN ('confirmed','checked_in')
          AND ${overlapWhere()}
        `, [room_id, check_out_date, check_in_date]);
                if (conf.length) throw new Error("ช่วงเวลานี้ห้องซ้ำกับการจองอื่น");
            }

            const bookingNo = "WUA-" + Date.now().toString().slice(-8);
            const [ins] = await conn.execute(`
        INSERT INTO bookings
        (booking_no, source, guest_id, room_type_id, room_id,
         check_in_date, check_out_date, nights, adults, children,
         status, total_amount, remarks)
        VALUES (?, 'backoffice', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [bookingNo, gId, room_type_id, room_id, check_in_date, check_out_date,
                nights, adults, children, status, total, remarks]);

            await conn.commit();
            res.status(201).json({ id: ins.insertId, booking_no: bookingNo, nights, total_amount: total });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("createBooking error:", e);
            res.status(400).json({ message: e.message || "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    }

    async function updateBooking(req, res) {
        const conn = await pool.getConnection();
        try {
            const { id } = req.params;
            const {
                room_type_id, room_id = null, check_in_date, check_out_date,
                adults, children, remarks, override_total = null
            } = req.body;

            await conn.beginTransaction();
            const [[bk]] = await conn.execute(`SELECT * FROM bookings WHERE id=? FOR UPDATE`, [id]);
            if (!bk) { await conn.rollback(); return res.status(404).json({ message: "ไม่พบการจอง" }); }

            let nights = bk.nights;
            let total = bk.total_amount;

            const ci = check_in_date || bk.check_in_date;
            const co = check_out_date || bk.check_out_date;
            nights = nightsBetween(ci, co);

            let rtId = room_type_id || bk.room_type_id;
            if (override_total != null) {
                total = Number(override_total);
            } else {
                const [[rt]] = await conn.execute(`SELECT base_price FROM room_types WHERE id=?`, [rtId]);
                total = Number(rt.base_price) * nights;
            }

            const nextRoomId = (room_id === null) ? bk.room_id : room_id;
            if (nextRoomId) {
                const [conf] = await conn.execute(`
          SELECT b.id FROM bookings b
          WHERE b.room_id = ? AND b.id <> ? AND b.status IN ('confirmed','checked_in')
          AND ${overlapWhere()}
        `, [nextRoomId, id, co, ci]);
                if (conf.length) { await conn.rollback(); return res.status(400).json({ message: "ห้องซ้ำกับการจองอื่น" }); }
            }

            await conn.execute(`
        UPDATE bookings
        SET room_type_id = COALESCE(?, room_type_id),
            room_id      = ?,
            check_in_date  = ?,
            check_out_date = ?,
            nights = ?,
            adults = COALESCE(?, adults),
            children = COALESCE(?, children),
            total_amount = ?,
            remarks = COALESCE(?, remarks)
        WHERE id=?
      `, [room_type_id ?? null, nextRoomId, ci, co, nights, adults ?? null, children ?? null, total, remarks ?? null, id]);

            await conn.commit();
            res.json({ message: "อัปเดตสำเร็จ", nights, total_amount: total });
        } catch (e) {
            await pool.query("ROLLBACK");
            console.error("updateBooking error:", e);
            res.status(400).json({ message: e.message || "เกิดข้อผิดพลาด" });
        } finally {
            conn.release();
        }
    }

    async function updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const allow = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];
            if (!allow.includes(status)) return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });

            await pool.execute(`UPDATE bookings SET status=? WHERE id=?`, [status, id]);
            res.json({ message: "อัปเดตสถานะเรียบร้อย" });
        } catch (e) {
            console.error("updateStatus error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function assignRoom(req, res) {
        try {
            const { id } = req.params;
            const { room_id } = req.body;
            if (!room_id) return res.status(400).json({ message: "ต้องระบุ room_id" });

            const [[bk]] = await pool.execute(`SELECT check_in_date, check_out_date FROM bookings WHERE id=?`, [id]);
            if (!bk) return res.status(404).json({ message: "ไม่พบการจอง" });

            const [conf] = await pool.execute(`
        SELECT b.id FROM bookings b
        WHERE b.room_id = ? AND b.id <> ? AND b.status IN ('confirmed','checked_in')
        AND ${overlapWhere()}
      `, [room_id, id, bk.check_out_date, bk.check_in_date]);
            if (conf.length) return res.status(400).json({ message: "ห้องนี้ถูกจองทับช่วงเวลา" });

            await pool.execute(`UPDATE bookings SET room_id=? WHERE id=?`, [room_id, id]);
            res.json({ message: "กำหนดห้องเรียบร้อย" });
        } catch (e) {
            console.error("assignRoom error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    async function cancelBooking(req, res) {
        try {
            const { id } = req.params;
            await pool.execute(`UPDATE bookings SET status='cancelled' WHERE id=?`, [id]);
            res.json({ message: "ยกเลิกการจองแล้ว" });
        } catch (e) {
            console.error("cancelBooking error:", e);
            res.status(500).json({ message: "เกิดข้อผิดพลาด" });
        }
    }

    return {
        listRoomTypes, listRooms, listGuestsQuick,
        listBookings, getBooking, createBooking, updateBooking,
        updateStatus, assignRoom, cancelBooking,
    };
};
