const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const pool = mysql.createPool({
  host: process.env.DB_HOST || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  port: process.env.DB_PORT || '3306',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'ต้องเข้าสู่ระบบก่อน' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token ไม่ถูกต้อง' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.execute(
      'INSERT INTO users (email, password_hash, full_name, phone, status) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone, 'active']
    );

    const userId = userResult.insertId;

    const [guestRole] = await pool.execute('SELECT id FROM roles WHERE code = ?', ['guest']);
    if (guestRole.length > 0) {
      await pool.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, guestRole[0].id]
      );
    }

    await pool.execute(
      'INSERT INTO guests (user_id, full_name, email, phone) VALUES (?, ?, ?, ?)',
      [userId, full_name, email, phone]
    );

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: userId,
        email,
        full_name,
        phone
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute(
      'SELECT id, email, password_hash, full_name, phone, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'บัญชีของคุณถูกระงับ' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, full_name, phone FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'ออกจากระบบสำเร็จ' });
});

app.get('/api/v1/room-types', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        description, 
        base_price, 
        capacity,
        images_json AS images,
        amenities
      FROM room_types 
      WHERE is_active = 1
    `);

    const parseImages = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.filter(Boolean);

      if (typeof raw === 'object') {
        try { return Array.isArray(raw) ? raw.filter(Boolean) : []; } catch { return []; }
      }

      if (typeof raw === 'string') {
        const s = raw.trim();
        if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
          try {
            const parsed = JSON.parse(s);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
          } catch {}
        }
        if (s.includes(',')) {
          return s.split(',').map(x => x.trim()).filter(Boolean);
        }
        return [s];
      }
      return [];
    };

    const parseAmenities = (raw) => {
      if (!raw) return ['Wi-Fi ฟรี', 'แอร์', 'ทีวี', 'อาหารเช้า'];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'object') return Array.isArray(raw) ? raw : ['Wi-Fi ฟรี', 'แอร์', 'ทีวี', 'อาหารเช้า'];
      if (typeof raw === 'string') {
        const s = raw.trim();
        if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
          try {
            const parsed = JSON.parse(s);
            return Array.isArray(parsed) ? parsed : ['Wi-Fi ฟรี', 'แอร์', 'ทีวี', 'อาหารเช้า'];
          } catch{}
        }
        if (s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean);
      }
      return ['Wi-Fi ฟรี', 'แอร์', 'ทีวี', 'อาหารเช้า'];
    };

    const roomTypes = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      base_price: Number(r.base_price) || 0,
      capacity: Number(r.capacity) || 0,
      images: parseImages(r.images),
      amenities: parseAmenities(r.amenities),
    }));

    res.json(roomTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/v1/room-types/:id', async (req, res) => {
  try {
    const [roomTypes] = await pool.execute(
      'SELECT id, code, name, description, base_price, capacity, images_json, is_active FROM room_types WHERE id = ? AND is_active = 1',
      [req.params.id]
    );

    if (roomTypes.length === 0) {
      return res.status(404).json({ message: 'ไม่พบห้องพัก' });
    }

    const room = roomTypes[0];
    room.images = room.images_json ? JSON.parse(room.images_json) : [];
    room.original_price = Math.round(room.base_price * 1.3);

    res.json(room);
  } catch (error) {
    console.error('Get room type error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.post('/api/v1/bookings', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { room_type_id, check_in_date, check_out_date, adults, children, guest_info, remarks } = req.body;

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const [roomTypes] = await connection.execute(
      'SELECT base_price FROM room_types WHERE id = ?',
      [room_type_id]
    );

    if (roomTypes.length === 0) {
      throw new Error('ไม่พบประเภทห้องพัก');
    }

    const totalAmount = roomTypes[0].base_price * nights;

    const [guests] = await connection.execute(
      'SELECT id FROM guests WHERE user_id = ?',
      [req.user.id]
    );

    let guestId;
    if (guests.length > 0) {
      guestId = guests[0].id;
      await connection.execute(
        'UPDATE guests SET full_name = ?, email = ?, phone = ? WHERE id = ?',
        [guest_info.full_name, guest_info.email, guest_info.phone, guestId]
      );
    } else {
      const [guestResult] = await connection.execute(
        'INSERT INTO guests (user_id, full_name, email, phone) VALUES (?, ?, ?, ?)',
        [req.user.id, guest_info.full_name, guest_info.email, guest_info.phone]
      );
      guestId = guestResult.insertId;
    }

    const bookingNo = 'WUA-' + Date.now().toString().slice(-8);

    const [bookingResult] = await connection.execute(`
      INSERT INTO bookings 
      (booking_no, source, guest_id, room_type_id, check_in_date, check_out_date, nights, adults, children, status, total_amount, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [bookingNo, 'web', guestId, room_type_id, check_in_date, check_out_date, nights, adults, children || 0, 'pending', totalAmount, remarks || null]);

    const bookingId = bookingResult.insertId;

    await connection.commit();

    res.status(201).json({
      message: 'จองห้องพักสำเร็จ',
      id: bookingId,
      booking_no: bookingNo,
      total_amount: totalAmount,
      nights
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({ message: error.message || 'เกิดข้อผิดพลาดในการจองห้องพัก' });
  } finally {
    connection.release();
  }
});

app.get('/api/v1/bookings', authenticateToken, async (req, res) => {
  try {
    const [guests] = await pool.execute(
      'SELECT id FROM guests WHERE user_id = ?',
      [req.user.id]
    );

    if (guests.length === 0) {
      return res.json([]);
    }

    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_no,
        b.check_in_date,
        b.check_out_date,
        b.nights,
        b.adults,
        b.children,
        b.status,
        b.total_amount,
        rt.name as room_type_name
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE b.guest_id = ?
      ORDER BY b.created_at DESC
    `, [guests[0].id]);

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' });
  }
});

app.get('/api/v1/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const [guests] = await pool.execute(
      'SELECT id FROM guests WHERE user_id = ?',
      [req.user.id]
    );

    if (guests.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูล' });
    }

    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_no,
        b.check_in_date,
        b.check_out_date,
        b.nights,
        b.adults,
        b.children,
        b.status,
        b.total_amount,
        b.remarks,
        rt.name as room_type_name,
        rt.description as room_description
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [req.params.id, guests[0].id]);

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'ไม่พบการจอง' });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.post('/api/v1/payments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { booking_id } = req.query;
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาอัปโหลดไฟล์' });
    }

    const [bookingRows] = await pool.execute(`
      SELECT b.id, b.total_amount, b.guest_id, b.status, g.user_id
      FROM bookings b
      LEFT JOIN guests g ON g.id = b.guest_id
      WHERE b.id = ?
    `, [booking_id]);
    if (bookingRows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบการจอง' });
    }
    const booking = bookingRows[0];

    const [fileResult] = await pool.execute(
      'INSERT INTO files (bucket, object_key, mime_type, size_bytes) VALUES (?, ?, ?, ?)',
      ['payments', req.file.filename, req.file.mimetype, req.file.size]
    );
    const fileId = fileResult.insertId;

    const [payResult] = await pool.execute(`
      INSERT INTO payments (booking_id, method, amount, status, slip_file_id, created_at)
      VALUES (?, ?, ?, 'pending', ?, NOW())
    `, [booking_id, 'transfer', booking.total_amount, fileId]);

    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', ['pending', booking_id]);

    res.json({
      message: 'อัปโหลดสลิปสำเร็จ รอการตรวจสอบจากแอดมิน',
      payment_id: payResult.insertId,
      slip_file: {
        id: fileId,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload payment error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลดสลิป' });
  }
});



app.get('/api/v1/payments/:bookingId', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT 
        p.id,
        p.method,
        p.amount,
        p.status,
        p.paid_at,
        f.object_key as slip_filename
      FROM payments p
      LEFT JOIN files f ON p.slip_file_id = f.id
      WHERE p.booking_id = ?
    `, [req.params.bookingId]);

    if (payments.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลการชำระเงิน' });
    }

    res.json(payments[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/v1/home-slides', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, subtitle, cta_text, cta_link, image_path, sort_order, is_active
      FROM home_slides
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC
    `);

    res.json(rows.map(r => ({
      id: r.id,
      title: r.title || '',
      subtitle: r.subtitle || '',
      cta_text: r.cta_text || '',
      cta_link: r.cta_link || '#',
      image_path: r.image_path,
      sort_order: r.sort_order,
      is_active: !!r.is_active
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/v1/bacnkaccount', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM bank_accounts
      WHERE 1
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

const adminAuthRouter = require('./routes/admin.auth.routes')(pool, JWT_SECRET);
app.use('/api/v1/admin/auth', adminAuthRouter);

const adminDashboardRouter = require('./routes/admin.dashboard.routes')(pool, JWT_SECRET);
app.use('/api/v1/admin/dashboard', adminDashboardRouter);

const adminUsersRouterFactory = require("./routes/admin.users.routes");
app.use("/api/v1/admin/users", adminUsersRouterFactory(pool));

const adminRoomsRouter = require("./routes/admin.rooms.routes")(pool);
app.use("/api/v1/admin/rooms", adminRoomsRouter);

const adminBookingsRoutes = require("./routes/admin.bookings.routes")(pool);
app.use("/api/v1/admin/bookings", adminBookingsRoutes);

const adminRoomTypesRoutes = require("./routes/admin.roomtypes.routes")(pool);
app.use("/api/v1/admin/room-types", adminRoomTypesRoutes);

const buildAdminPaymentsRouter = require("./routes/admin.payments.routes");
app.use("/api/v1/admin/payments", buildAdminPaymentsRouter(pool));

app.use("/api/v1/admin/home-slides", require("./routes/admin.slides.routes")(pool));

const adminUploadRouter = require("./routes/admin.upload.routes")(pool);
app.use("/api/v1/admin/upload", adminUploadRouter);

const adminReportsRouter = require("./routes/admin.reports.routes")(pool);
app.use("/api/v1/admin/reports", adminReportsRouter);

const adminAdminsRouter = require("./routes/admin.admins.routes")(pool);
app.use("/api/v1/admin/admins", adminAdminsRouter);


const adminSettingsRoutes = require("./routes/admin.settings.routes");
app.use("/api/v1/admin/settings", adminSettingsRoutes(pool));

const adminBankAccountsRoutes = require("./routes/admin.bankaccounts.routes");
app.use("/api/v1/admin/bank-accounts", adminBankAccountsRoutes(pool));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/v1`);
});