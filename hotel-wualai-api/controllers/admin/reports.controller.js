function parseDateOnly(s) {
  if (typeof s !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}
const dayStart = (d) => `${d} 00:00:00`;
const dayEnd   = (d) => `${d} 23:59:59`;
const clampInt = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));

function makeRevenueReport(pool) {
  return async function revenueReport(req, res) {
    try {
      const today = new Date();
      const defEnd = today.toISOString().slice(0,10);
      const defStart = new Date(today.getTime() - 29*86400000).toISOString().slice(0,10);

      const start = parseDateOnly(req.query.start) || defStart;
      const end   = parseDateOnly(req.query.end)   || defEnd;
      const gran  = (req.query.granularity || "day").toLowerCase(); // day|month

      const startTs = dayStart(start);
      const endTs   = dayEnd(end);

      const [[totals]] = await pool.execute(
        `SELECT COALESCE(SUM(p.amount),0) AS total_revenue,
                COUNT(*) AS payments_count
           FROM payments p
          WHERE p.status='verified'
            AND p.paid_at BETWEEN ? AND ?`,
        [startTs, endTs]
      );
      const avg_ticket = totals.payments_count ? Math.round(totals.total_revenue / totals.payments_count) : 0;

      const [[pend]] = await pool.execute(
        `SELECT COUNT(*) AS pending_count
           FROM payments p
          WHERE p.status='pending'
            AND p.created_at BETWEEN ? AND ?`,
        [startTs, endTs]
      );

      let breakdownRows = [];
      if (gran === "month") {
        const [rows] = await pool.execute(
          `SELECT DATE_FORMAT(p.paid_at, '%Y-%m-01') AS bucket, SUM(p.amount) AS total
             FROM payments p
            WHERE p.status='verified'
              AND p.paid_at BETWEEN ? AND ?
         GROUP BY DATE_FORMAT(p.paid_at, '%Y-%m-01')
         ORDER BY bucket ASC`,
          [startTs, endTs]
        );
        breakdownRows = rows;
      } else {
        const [rows] = await pool.execute(
          `SELECT DATE(p.paid_at) AS bucket, SUM(p.amount) AS total
             FROM payments p
            WHERE p.status='verified'
              AND p.paid_at BETWEEN ? AND ?
         GROUP BY DATE(p.paid_at)
         ORDER BY bucket ASC`,
          [startTs, endTs]
        );
        breakdownRows = rows;
      }

      const [byMethod] = await pool.execute(
        `SELECT p.method, SUM(p.amount) AS total, COUNT(*) AS count
           FROM payments p
          WHERE p.status='verified'
            AND p.paid_at BETWEEN ? AND ?
       GROUP BY p.method
       ORDER BY total DESC`,
        [startTs, endTs]
      );

      const [topRoomTypes] = await pool.execute(
        `SELECT rt.id, rt.name,
                SUM(p.amount) AS total_revenue,
                COUNT(DISTINCT b.id) AS bookings_count
           FROM payments p
           JOIN bookings b  ON b.id = p.booking_id
           JOIN room_types rt ON rt.id = b.room_type_id
          WHERE p.status='verified'
            AND p.paid_at BETWEEN ? AND ?
       GROUP BY rt.id, rt.name
       ORDER BY total_revenue DESC
       LIMIT 10`,
        [startTs, endTs]
      );

      const [[roomsCount]] = await pool.execute(
        `SELECT COUNT(*) AS rooms_total FROM rooms WHERE status <> 'inactive'`
      );
      const rooms_total = Number(roomsCount.rooms_total || 0);

      const [nightsRows] = await pool.execute(
        `SELECT COALESCE(SUM(b.nights),0) AS nights_sold,
                COUNT(*) AS bookings_count
           FROM bookings b
          WHERE b.status IN ('confirmed','checked_in','checked_out')
            AND b.check_in_date BETWEEN ? AND ?`,
        [start, end]
      );

      const nights_sold = Number(nightsRows[0]?.nights_sold || 0);
      const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
      const occupancy_pct = rooms_total ? Math.round((nights_sold / (rooms_total * days)) * 100) : 0;

      const [recent] = await pool.execute(
        `SELECT p.id, p.booking_id, p.method, p.amount, p.status, p.created_at, p.paid_at,
                b.booking_no, g.full_name AS guest_name,
                f.object_key AS slip_filename
           FROM payments p
      LEFT JOIN files f ON f.id = p.slip_file_id
           JOIN bookings b   ON b.id = p.booking_id
           JOIN guests g     ON g.id = b.guest_id
          WHERE p.status IN ('verified','pending','rejected')
            AND p.created_at BETWEEN ? AND ?
       ORDER BY p.created_at DESC
          LIMIT 20`,
        [startTs, endTs]
      );

      res.json({
        range: { start, end, granularity: gran },
        kpi: {
          total_revenue: Number(totals.total_revenue || 0),
          payments_count: Number(totals.payments_count || 0),
          avg_ticket,
          pending_count: Number(pend.pending_count || 0),
          nights_sold,
          rooms_total,
          occupancy_pct,
          days
        },
        breakdown: breakdownRows.map(r => ({ bucket: r.bucket, total: Number(r.total || 0) })),
        by_method: byMethod.map(m => ({ method: m.method, total: Number(m.total || 0), count: Number(m.count || 0) })),
        top_room_types: topRoomTypes.map(t => ({
          id: t.id, name: t.name,
          total_revenue: Number(t.total_revenue || 0),
          bookings_count: Number(t.bookings_count || 0),
        })),
        recent
      });
    } catch (e) {
      console.error("revenueReport error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeOccupancyReport(pool) {
  return async function occupancyReport(req, res) {
    try {
      const today = new Date();
      const defEnd = today.toISOString().slice(0,10);
      const defStart = new Date(today.getTime() - 6*86400000).toISOString().slice(0,10);

      const start = parseDateOnly(req.query.start) || defStart;
      const end   = parseDateOnly(req.query.end)   || defEnd;

      const [[roomsCount]] = await pool.execute(
        `SELECT COUNT(*) AS rooms_total FROM rooms WHERE status <> 'inactive'`
      );
      const rooms_total = Number(roomsCount.rooms_total || 0);

      const [byDay] = await pool.query(
        `
        WITH RECURSIVE dx AS (
          SELECT DATE(?) AS d
          UNION ALL
          SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM dx WHERE d < DATE(?)
        )
        SELECT dx.d AS day,
               COUNT(b.id) AS occupied_rooms
          FROM dx
     LEFT JOIN bookings b
            ON b.status IN ('confirmed','checked_in','checked_out')
           AND dx.d >= DATE(b.check_in_date)
           AND dx.d <  DATE(b.check_out_date)
      GROUP BY dx.d
      ORDER BY dx.d ASC
        `,
        [start, end]
      );

      const dayRows = byDay.map(r => {
        const occ = Number(r.occupied_rooms || 0);
        const pct = rooms_total ? Math.round((occ / rooms_total) * 100) : 0;
        return { day: r.day, occupied: occ, available: Math.max(rooms_total - occ, 0), occupancy_pct: pct };
      });

      const [byRoomType] = await pool.execute(
        `SELECT rt.id, rt.name, SUM(b.nights) AS nights_sold, COUNT(*) AS bookings
           FROM bookings b
           JOIN room_types rt ON rt.id = b.room_type_id
          WHERE b.status IN ('confirmed','checked_in','checked_out')
            AND b.check_in_date BETWEEN ? AND ?
       GROUP BY rt.id, rt.name
       ORDER BY nights_sold DESC`,
        [start, end]
      );

      const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
      const nights_sold = byRoomType.reduce((s, r) => s + Number(r.nights_sold || 0), 0);
      const occupancy_avg = rooms_total ? Math.round((nights_sold / (rooms_total * days)) * 100) : 0;

      res.json({
        range: { start, end },
        kpi: {
          rooms_total,
          days,
          nights_sold,
          occupancy_avg_pct: occupancy_avg
        },
        by_day: dayRows,
        by_room_type: byRoomType.map(r => ({
          id: r.id, name: r.name,
          nights_sold: Number(r.nights_sold || 0),
          bookings: Number(r.bookings || 0),
        }))
      });
    } catch (e) {
      console.error("occupancyReport error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

function makeBookingsReport(pool) {
  return async function bookingsReport(req, res) {
    try {
      const today = new Date();
      const defEnd = today.toISOString().slice(0,10);
      const defStart = new Date(today.getTime() - 29*86400000).toISOString().slice(0,10);

      const start = parseDateOnly(req.query.start) || defStart;
      const end   = parseDateOnly(req.query.end)   || defEnd;
      const status = (req.query.status || "%").toString();
      const roomTypeId = req.query.room_type_id ? Number(req.query.room_type_id) : null;

      const page  = clampInt(req.query.page, 1, 1000000) || 1;
      const limit = clampInt(req.query.limit, 1, 100) || 20;
      const offset = (page - 1) * limit;

      const [sumRows] = await pool.execute(
        `SELECT 
            COUNT(*) AS bookings_count,
            COALESCE(SUM(b.nights),0) AS nights,
            COALESCE(SUM(b.total_amount),0) AS revenue
           FROM bookings b
      LEFT JOIN room_types rt ON rt.id = b.room_type_id
          WHERE b.check_in_date BETWEEN ? AND ?
            AND b.status LIKE ?
            ${roomTypeId ? "AND b.room_type_id = ?" : ""}
        `,
        roomTypeId ? [start, end, status, roomTypeId] : [start, end, status]
      );
      const k = sumRows[0] || { bookings_count:0, nights:0, revenue:0 };
      const adr = Number(k.nights) ? Math.round(Number(k.revenue) / Number(k.nights)) : 0;

      const [byStatus] = await pool.execute(
        `SELECT b.status, COUNT(*) AS count
           FROM bookings b
          WHERE b.check_in_date BETWEEN ? AND ?
            AND b.status LIKE ?
            ${roomTypeId ? "AND b.room_type_id = ?" : ""}
       GROUP BY b.status
       ORDER BY count DESC`,
        roomTypeId ? [start, end, status, roomTypeId] : [start, end, status]
      );

      const [items] = await pool.execute(
        `SELECT b.id, b.booking_no, b.check_in_date, b.check_out_date, b.nights,
                b.adults, b.children, b.status, b.total_amount, b.created_at,
                rt.name AS room_type_name,
                g.full_name AS guest_name
           FROM bookings b
           JOIN room_types rt ON rt.id = b.room_type_id
           JOIN guests g       ON g.id = b.guest_id
          WHERE b.check_in_date BETWEEN ? AND ?
            AND b.status LIKE ?
            ${roomTypeId ? "AND b.room_type_id = ?" : ""}
       ORDER BY b.check_in_date DESC, b.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        roomTypeId ? [start, end, status, roomTypeId] : [start, end, status]
      );

      const [[totalRow]] = await pool.execute(
        `SELECT COUNT(*) AS total
           FROM bookings b
          WHERE b.check_in_date BETWEEN ? AND ?
            AND b.status LIKE ?
            ${roomTypeId ? "AND b.room_type_id = ?" : ""}`,
        roomTypeId ? [start, end, status, roomTypeId] : [start, end, status]
      );

      res.json({
        range: { start, end },
        filter: { status, room_type_id: roomTypeId },
        kpi: {
          bookings_count: Number(k.bookings_count || 0),
          nights: Number(k.nights || 0),
          revenue: Number(k.revenue || 0),
          adr
        },
        by_status: byStatus.map(s => ({ status: s.status, count: Number(s.count || 0) })),
        page, limit, total: Number(totalRow.total || 0),
        items
      });
    } catch (e) {
      console.error("bookingsReport error:", e);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
}

module.exports = {
  makeRevenueReport,
  makeOccupancyReport,
  makeBookingsReport
};
