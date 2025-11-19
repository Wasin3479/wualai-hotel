function makeListBookings(pool) {
  return async function listBookings(req, res) {
    try {
      const status = (req.query.status ?? "%").toString();
      const [rows] = await pool.execute(
        `SELECT b.id, b.booking_no, b.status, b.check_in_date, b.check_out_date,
                b.nights, b.total_amount,
                rt.name AS room_type_name,
                g.full_name AS guest_name
           FROM bookings b
           JOIN room_types rt ON rt.id = b.room_type_id
           JOIN guests g ON g.id = b.guest_id
          WHERE b.status LIKE ?
          ORDER BY b.created_at DESC
          LIMIT 200`,
        [status]
      );
      res.json(rows);
    } catch (e) {
      console.error("listBookings error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeListPendingPayments(pool) {
  return async function listPendingPayments(_req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.id, p.booking_id, p.method, p.amount, p.status, p.created_at, p.paid_at,
                f.object_key AS slip_filename,
                b.booking_no, g.full_name AS guest_name
           FROM payments p
           LEFT JOIN files f ON f.id = p.slip_file_id
           JOIN bookings b ON b.id = p.booking_id
           JOIN guests g   ON g.id = b.guest_id
          WHERE p.status = 'pending'
          ORDER BY p.created_at DESC`
      );
      res.json(rows);
    } catch (e) {
      console.error("listPendingPayments error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

module.exports = { makeListBookings, makeListPendingPayments };
