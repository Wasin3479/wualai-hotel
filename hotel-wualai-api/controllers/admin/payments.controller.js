function makeListPending(pool) {
  return async function listPending(_req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.id, p.booking_id, p.method, p.amount, p.status, p.created_at, p.paid_at,
               b.booking_no, b.status AS booking_status,
               g.full_name AS guest_name,
               f.object_key AS slip_filename
        FROM payments p
        LEFT JOIN files f ON f.id = p.slip_file_id
        JOIN bookings b   ON b.id = p.booking_id
        JOIN guests g     ON g.id = b.guest_id
        WHERE p.status = 'pending'
        ORDER BY p.created_at DESC
      `);

      const items = rows.map(r => ({
        id: r.id,
        booking_id: r.booking_id,
        booking_no: r.booking_no,
        booking_status: r.booking_status,
        guest_name: r.guest_name,
        method: r.method,
        amount: Number(r.amount) || 0,
        status: r.status,
        created_at: r.created_at,
        paid_at: r.paid_at,
        slip_path: r.slip_filename ? `/uploads/${r.slip_filename}` : null
      }));

      res.json(items);
    } catch (e) {
      console.error("listPending error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeListRecent(pool) {
  return async function listRecent(req, res) {
    try {
      let limit = parseInt(req.query.limit, 10);
      if (!Number.isFinite(limit) || limit <= 0) limit = 50;
      limit = Math.min(200, Math.max(1, limit)); // 1..200

      const sql = `
        SELECT p.id, p.booking_id, p.method, p.amount, p.status, p.created_at, p.paid_at,
               b.booking_no, g.full_name AS guest_name,
               f.object_key AS slip_filename
        FROM payments p
        LEFT JOIN files f ON f.id = p.slip_file_id
        JOIN bookings b   ON b.id = p.booking_id
        JOIN guests g     ON g.id = b.guest_id
        WHERE p.status IN ('pending','verified','rejected')
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;

      const [rows] = await pool.query(sql);

      res.json(rows.map(r => ({
        id: r.id,
        booking_id: r.booking_id,
        booking_no: r.booking_no,
        guest_name: r.guest_name,
        method: r.method,
        amount: Number(r.amount) || 0,
        status: r.status,
        created_at: r.created_at,
        paid_at: r.paid_at,
        slip_path: r.slip_filename ? `/uploads/${r.slip_filename}` : null
      })));
    } catch (e) {
      console.error("listRecent error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}


function makeGetPayment(pool) {
  return async function getPayment(req, res) {
    try {
      const { id } = req.params;
      const [[p]] = await pool.execute(`
        SELECT p.id, p.booking_id, p.method, p.amount, p.status, p.created_at, p.paid_at,
               b.booking_no, b.status AS booking_status, b.total_amount, b.check_in_date, b.check_out_date,
               g.full_name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
               f.object_key AS slip_filename
        FROM payments p
        LEFT JOIN files f ON f.id = p.slip_file_id
        JOIN bookings b   ON b.id = p.booking_id
        JOIN guests g     ON g.id = b.guest_id
        WHERE p.id = ?
      `, [id]);

      if (!p) return res.status(404).json({ message: "ไม่พบรายการชำระเงิน" });

      res.json({
        id: p.id,
        booking: {
          id: p.booking_id,
          booking_no: p.booking_no,
          status: p.booking_status,
          total_amount: Number(p.total_amount) || 0,
          check_in_date: p.check_in_date,
          check_out_date: p.check_out_date,
          guest_name: p.guest_name,
          guest_email: p.guest_email,
          guest_phone: p.guest_phone
        },
        method: p.method,
        amount: Number(p.amount) || 0,
        status: p.status,
        created_at: p.created_at,
        paid_at: p.paid_at,
        slip_path: p.slip_filename ? `/uploads/${p.slip_filename}` : null
      });
    } catch (e) {
      console.error("getPayment error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeVerify(pool) {
  return async function verify(req, res) {
    const conn = await pool.getConnection();
    try {
      const { id } = req.params;
      const { approved } = req.body; // true|false

      await conn.beginTransaction();

      const [[pay]] = await conn.execute(`SELECT * FROM payments WHERE id = ? FOR UPDATE`, [id]);
      if (!pay) {
        await conn.rollback();
        return res.status(404).json({ message: "ไม่พบรายการชำระเงิน" });
      }
      if (pay.status !== 'pending') {
        await conn.rollback();
        return res.status(400).json({ message: "สถานะไม่พร้อมตรวจ" });
      }

      if (approved) {
        await conn.execute(`UPDATE payments SET status='verified', paid_at = NOW() WHERE id = ?`, [id]);
        await conn.execute(
          `UPDATE bookings SET status='confirmed' WHERE id = ? AND status IN ('pending','awaiting_payment')`,
          [pay.booking_id]
        );
      } else {
        await conn.execute(`UPDATE payments SET status='rejected' WHERE id = ?`, [id]);
        await conn.execute(
          `UPDATE bookings SET status='pending' WHERE id = ? AND status IN ('pending','awaiting_payment','confirmed')`,
          [pay.booking_id]
        );
      }

      await conn.commit();
      res.json({ message: approved ? "ยืนยันการชำระเงินแล้ว" : "ปฏิเสธการชำระเงินแล้ว" });
    } catch (e) {
      await conn.rollback();
      console.error("verify payment error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    } finally {
      conn.release();
    }
  };
}

module.exports = {
  makeListPending,
  makeListRecent,
  makeGetPayment,
  makeVerify,
};
