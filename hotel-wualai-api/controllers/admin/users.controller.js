const bcrypt = require("bcryptjs");

function makeListUsers(pool) {
  return async function listUsers(req, res) {
    try {
      const page  = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20));
      const offset = (page - 1) * limit;

      const q = (req.query.q || "").toString().trim();
      const params = [];
      const whereParts = [];

      if (q) {
        const kw = `%${q}%`;
        whereParts.push("(u.email LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ?)");
        params.push(kw, kw, kw);
      }
      const whereSQL = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

      const listSQL = `
        SELECT u.id, u.email, u.full_name, u.phone, u.created_at
        FROM users u
        ${whereSQL}
        ORDER BY u.created_at DESC
        LIMIT ${offset}, ${limit}
      `;
      const [rows] = await pool.query(listSQL, params);

      const countSQL = `SELECT COUNT(*) AS total FROM users u ${whereSQL}`;
      const [[{ total } = { total: 0 }]] = await pool.query(countSQL, params);

      res.json({ page, limit, total: Number(total || 0), items: rows });
    } catch (e) {
      console.error("listUsers error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงรายการผู้ใช้" });
    }
  };
}

function makeGetUser(pool) {
  return async function getUser(req, res) {
    try {
      const { id } = req.params;
      const [[user]] = await pool.execute(
        `SELECT id, email, full_name, phone, created_at FROM users WHERE id = ?`,
        [id]
      );
      if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
      res.json(user);
    } catch (e) {
      console.error("getUser error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeCreateUser(pool) {
  return async function createUser(req, res) {
    const conn = await pool.getConnection();
    try {
      const { email, password, full_name, phone } = req.body;

      const [[dup]] = await conn.execute("SELECT id FROM users WHERE email = ?", [email]);
      if (dup) {
        conn.release();
        return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
      }

      await conn.beginTransaction();

      const hash = await bcrypt.hash(password, 10);
      const [r] = await conn.execute(
        `INSERT INTO users (email, password_hash, full_name, phone)
         VALUES (?, ?, ?, ?)`,
        [email, hash, full_name || null, phone || null]
      );

      await conn.commit();
      res.status(201).json({ id: r.insertId, message: "สร้างผู้ใช้สำเร็จ" });
    } catch (e) {
      await conn.rollback();
      console.error("createUser error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    } finally {
      conn.release();
    }
  };
}

function makeUpdateUser(pool) {
  return async function updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, full_name, phone } = req.body;

      if (email) {
        const [[dup]] = await pool.execute(
          "SELECT id FROM users WHERE email = ? AND id <> ?",
          [email, id]
        );
        if (dup) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
      }

      await pool.execute(
        `UPDATE users
           SET email = COALESCE(?, email),
               full_name = COALESCE(?, full_name),
               phone = COALESCE(?, phone)
         WHERE id = ?`,
        [email ?? null, full_name ?? null, phone ?? null, id]
      );

      res.json({ message: "อัปเดตผู้ใช้เรียบร้อย" });
    } catch (e) {
      console.error("updateUser error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeChangePassword(pool) {
  return async function changePassword(req, res) {
    try {
      const { id } = req.params;
      const { new_password } = req.body;
      if (!new_password || new_password.length < 6) {
        return res.status(400).json({ message: "รหัสผ่านใหม่ไม่ถูกต้อง (อย่างน้อย 6 ตัวอักษร)" });
      }
      const hash = await bcrypt.hash(new_password, 10);
      await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hash, id]);
      res.json({ message: "เปลี่ยนรหัสผ่านแล้ว" });
    } catch (e) {
      console.error("changePassword error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeGetUserDetail(pool) {
  return async function getUserDetail(req, res) {
    try {
      const { id } = req.params;

      const [[user]] = await pool.execute(
        `SELECT id, email, full_name, phone, created_at
           FROM users WHERE id = ?`,
        [id]
      );
      if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

      const [guestRows] = await pool.execute(
        `SELECT id FROM guests WHERE user_id = ?`,
        [id]
      );
      if (!guestRows.length) {
        return res.json({
          user,
          summary: { total: 0, upcoming: 0, in_house: 0, completed: 0, no_show: 0, cancelled: 0 },
          bookings: { all: [], upcoming: [], in_house: [], completed: [], no_show: [], cancelled: [] }
        });
      }
      const guestId = guestRows[0].id;

      const [bookings] = await pool.execute(
        `SELECT b.id, b.booking_no, b.status, b.check_in_date, b.check_out_date,
                b.nights, b.adults, b.children, b.total_amount, b.created_at,
                rt.name AS room_type_name
           FROM bookings b
           JOIN room_types rt ON rt.id = b.room_type_id
          WHERE b.guest_id = ?
          ORDER BY b.check_in_date DESC, b.id DESC`,
        [guestId]
      );

      let payMap = new Map();
      if (bookings.length) {
        const ids = bookings.map(b => b.id);
        const [pays] = await pool.query(
          `SELECT p.booking_id, p.status, p.paid_at, p.created_at
             FROM payments p
            WHERE p.booking_id IN (?)
            ORDER BY p.created_at DESC`,
          [ids]
        );
        for (const p of pays) {
          if (!payMap.has(p.booking_id)) payMap.set(p.booking_id, { status: p.status, paid_at: p.paid_at });
        }
      }

      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const enrich = (b) => {
        const ci = new Date(b.check_in_date);
        const co = new Date(b.check_out_date);
        const pay = payMap.get(b.id) || null;

        let cat = "other";
        if (b.status === "checked_in") cat = "in_house";
        else if (b.status === "checked_out") cat = "completed";
        else if (b.status === "cancelled") cat = "cancelled";
        else if (ci >= startOfToday && ["pending","confirmed"].includes(b.status)) cat = "upcoming";
        else if (ci < startOfToday && ["pending","confirmed"].includes(b.status)) cat = "no_show";

        return {
          ...b,
          payment_status: pay?.status || null,
          payment_paid_at: pay?.paid_at || null,
          category: cat,
          check_in_date: b.check_in_date,
          check_out_date: b.check_out_date,
        };
      };

      const enriched = bookings.map(enrich);

      const buckets = {
        upcoming:   enriched.filter(x => x.category === "upcoming"),
        in_house:   enriched.filter(x => x.category === "in_house"),
        completed:  enriched.filter(x => x.category === "completed"),
        no_show:    enriched.filter(x => x.category === "no_show"),
        cancelled:  enriched.filter(x => x.category === "cancelled"),
      };

      const summary = {
        total: enriched.length,
        upcoming: buckets.upcoming.length,
        in_house: buckets.in_house.length,
        completed: buckets.completed.length,
        no_show: buckets.no_show.length,
        cancelled: buckets.cancelled.length,
      };

      res.json({
        user,
        summary,
        bookings: { all: enriched, ...buckets },
      });
    } catch (e) {
      console.error("getUserDetail error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}


module.exports = {
  makeListUsers,
  makeGetUser,
  makeCreateUser,
  makeUpdateUser,
  makeChangePassword,
  makeGetUserDetail
};
